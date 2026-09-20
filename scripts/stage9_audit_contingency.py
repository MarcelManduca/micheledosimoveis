#!/usr/bin/env python3
import urllib.request
import urllib.error
import ssl
import re
import sys
from urllib.parse import urljoin

import os

BASE_URL = os.environ.get("AUDIT_BASE_URL", "https://micheledosimoveis.com.br")
LEGACY_PROJECT = os.environ.get("BANNED_LEGACY_PROJECT", "ppndlwatmyiexpqskdxg")
BANNED_DOMAINS = [
    d.strip()
    for d in os.environ.get("BANNED_LEGACY_DOMAINS", "").split(",")
    if d.strip()
]

def get_ssl_context():
    return ssl.create_default_context()

def fetch_url(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) MicheleStage9Audit/1.0"}
    )
    ctx = get_ssl_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            content = resp.read()
            return resp.status, resp.info(), content
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()
    except Exception as e:
        return 0, {}, str(e).encode('utf-8')

def main():
    print("=== INICIANDO AUDITORIA DE CONTINGÊNCIA - ETAPA 9 ===")
    print(f"Target: {BASE_URL}\n")

    # Validação rigorosa de configuração obrigatória
    if not BANNED_DOMAINS:
        print("❌ CONFIGURAÇÃO OBRIGATÓRIA AUSENTE:")
        print("   Defina a variável BANNED_LEGACY_DOMAINS (ex: BANNED_LEGACY_DOMAINS=\"dominio1.com,dominio2.com\") para executar a auditoria.")
        sys.exit(1)

    # 1. Obter a página inicial
    print("[1/4] Carregando a página inicial...")
    status, headers, content_bytes = fetch_url(BASE_URL)
    content = content_bytes.decode("utf-8", errors="ignore")

    if status != 200:
        print(f"❌ Falha ao carregar a página inicial: HTTP {status}")
        sys.exit(1)
    print("✅ Página inicial carregada com sucesso (HTTP 200).")

    # 2. Extrair scripts e links (assets) da Home Page
    print("\n[2/4] Analisando assets e referências do HTML...")
    # Encontrar links para arquivos js e css
    scripts = re.findall(r'src=["\']([^"\']+\.js[^"\']*)["\']', content)
    stylesheets = re.findall(r'href=["\']([^"\']+\.css[^"\']*)["\']', content)

    assets = []
    for s in scripts:
        assets.append(urljoin(BASE_URL, s))
    for s in stylesheets:
        assets.append(urljoin(BASE_URL, s))

    print(f"Detectados {len(assets)} assets no HTML principal.")

    # 3. Auditar cada asset para vazamentos e referências legadas
    print("\n[3/4] Baixando e auditando conteúdo dos assets...")
    leak_detected = False
    legacy_ref_detected = False

    # Adicionar também o manifest se disponível
    assets.append(urljoin(BASE_URL, "/assets/manifest.json")) # caso exista

    audited_count = 0
    for asset_url in set(assets):
        if not asset_url.startswith(BASE_URL):
            # Se apontar para fora (ex. google fonts ou cdn), reportar e auditar
            print(f"  External asset: {asset_url}")
            has_banned_domain = any(b in asset_url for b in BANNED_DOMAINS)
            if (LEGACY_PROJECT and LEGACY_PROJECT in asset_url) or has_banned_domain:
                print(f"  ⚠️ ALERTA: Asset externo aponta para domínio proibido / Projeto antigo: {asset_url}")
                legacy_ref_detected = True
            continue

        a_status, a_headers, a_content_bytes = fetch_url(asset_url)
        if a_status != 200:
            # Muitos assets relativos ou manifest.json podem dar 404, apenas ignorar se não forem críticos
            if "/assets/manifest.json" in asset_url and a_status == 404:
                continue
            print(f"  ⚠️ Asset retornado com erro {a_status}: {asset_url}")
            continue

        audited_count += 1
        a_content = a_content_bytes.decode("utf-8", errors="ignore")

        # Procurar vazamento real de chaves privadas (padrão sb_secret_ seguido por caracteres)
        # E também garantir que o segredo do sync não está exposto
        secret_key_match = re.search(r'sb_secret_[a-zA-Z0-9_-]{20,}', a_content)
        sync_webhook_match = "fbfa6d33e993b5" in a_content # parte do segredo conhecido em .env.homolog.local

        has_secret_key_var = "SUPABASE_SECRET_KEY" in a_content and not ("process.env.SUPABASE_SECRET_KEY" in a_content or "SUPABASE_SECRET_KEY.startsWith" in a_content)

        # Procurar referências ao projeto antigo
        has_legacy_ref = bool(LEGACY_PROJECT and LEGACY_PROJECT in a_content)
        has_banned_ref = any(b in a_content for b in BANNED_DOMAINS)

        if secret_key_match or sync_webhook_match or has_secret_key_var:
            print(f"  ❌ VAZAMENTO DE SEGREDOS REAL DETECTADO em: {asset_url}")
            if secret_key_match:
                print(f"    Encontrado: {secret_key_match.group(0)[:15]}...")
            leak_detected = True
        if has_legacy_ref or has_banned_ref:
            print(f"  ❌ REFERÊNCIA LEGADA/PROIBIDA DETECTADA em: {asset_url}")
            legacy_ref_detected = True

    print(f"Total de assets próprios auditados: {audited_count}")

    # 4. Validar comportamento das rotas administrativas e de autenticação
    print("\n[4/4] Validando resposta inicial de rotas (/auth e /admin)...")

    # Verificar página de login
    auth_status, auth_headers, _ = fetch_url(BASE_URL + "/auth")
    print(f"  Rota '/auth': HTTP {auth_status}")

    # Verificar rota de admin (deve dar redirect ou renderizar apenas o shell de carregamento)
    admin_status, admin_headers, admin_body = fetch_url(BASE_URL + "/admin")
    location = admin_headers.get("location") or admin_headers.get("Location")

    print(f"  Rota '/admin': HTTP {admin_status} | Redirecionamento: {location}")

    is_shell_safe = False
    body_text = admin_body.decode("utf-8", errors="ignore")

    if admin_status in (302, 307, 308) and location and "/auth" in location:
        is_shell_safe = True
    elif admin_status in (401, 403):
        is_shell_safe = True
    elif admin_status == 200:
        # TanStack Start SSR serve o invólucro do app (HTTP 200) com "Carregando painel..."
        # e redireciona no client-side via useEffect do React se não houver sessão ativa.
        # Nota: Isto comprova apenas que dados privados não foram expostos no HTML inicial do shell.
        has_loading_shell = "carregando painel" in body_text.lower()
        has_admin_content = "importar imóvel da" in body_text.lower() or "imóveis cadastrados" in body_text.lower()

        if has_loading_shell and not has_admin_content:
            print("  ✅ Rota /admin renderiza apenas o shell de carregamento inicial (sem dados administrativos no HTML inicial).")
            is_shell_safe = True
        elif has_admin_content:
            print("  ❌ VAZAMENTO DE DADOS: O conteúdo administrativo foi renderizado no HTML sem sessão ativa!")

    if is_shell_safe:
        print("  ✅ Shell de /admin sem vazamento de dados no HTML inicial.")
    else:
        print("  ❌ Rota /admin exposta! Conteúdo renderizado sem autenticação.")

    print("\n=== RESUMO DO LAUDO DE AUDITORIA ===")
    print(f"1. Vazamento de Secrets nos Assets Auditados ({audited_count} arquivos): {'❌ SIM (FALHA)' if leak_detected else '✅ NÃO (SUCESSO)'}")
    print(f"2. Referências a projeto legado/domínios proibidos configurados: {'❌ SIM (FALHA)' if legacy_ref_detected else '✅ NÃO (SUCESSO)'}")
    print(f"3. Shell Inicial (/admin): {'✅ SHELL SEGURO (SUCESSO)' if is_shell_safe else '❌ DADOS EXPOSTOS (FALHA)'}")
    print("   (Nota: Carregar o shell do cliente não comprova autorização server-side completa)")

    if not leak_detected and not legacy_ref_detected and is_shell_safe:
        print("\n✅ AUDITORIA CONCLUÍDA COM SUCESSO NO ESCOPO DOS ASSETS E ENDPOINTS VERIFICADOS!")
        sys.exit(0)
    else:
        print("\n❌ AUDITORIA CONCLUÍDA: FORAM ENCONTRADOS PROBLEMAS NO ESCOPO AUDITADO.")
        sys.exit(1)

if __name__ == "__main__":
    main()
