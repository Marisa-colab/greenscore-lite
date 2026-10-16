export interface GcpTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  commonIssues: {
    problem: string;
    symptom: string;
    solution: string;
    command?: string;
  }[];
}

export const GCP_TOPICS: GcpTopic[] = [
  {
    id: 'cloud-run',
    title: 'Cloud Run / Containers',
    icon: 'Server',
    description: 'Problemas de implantação de contêineres, porta 3000/8080, CORS ou tempo limite de solicitação.',
    commonIssues: [
      {
        problem: 'Erro de Binding de Porta (Port Mapping)',
        symptom: 'Container failed to start or revision failed to become ready.',
        solution: 'Certifique-se de que o seu servidor backend aceita conexões em 0.0.0.0 e utiliza a variável de ambiente PORT (ou a porta padrão 3000/8080).',
        command: 'gcloud run deploy --image gcr.io/SEU_PROJETO/APP --port 3000 --allow-unauthenticated'
      },
      {
        problem: 'Erros de CORS na comunicação Frontend e Backend',
        symptom: 'Access to fetch at backend from origin frontend has been blocked by CORS policy.',
        solution: 'Configure os cabeçalhos Access-Control-Allow-Origin no servidor Express/Fastify ou utilize o proxy reverso do Vite em desenvolvimento.',
        command: 'app.use(cors({ origin: "https://seu-frontend.run.app", credentials: true }));'
      },
      {
        problem: 'Permissões IAM e Acesso Público',
        symptom: '403 Forbidden / Your client does not have permission to get URL from this server.',
        solution: 'Conceda a permissão "roles/run.invoker" ao utilizador especial "allUsers" para tornar a interface/serviço acessível publicamente.',
        command: 'gcloud run services add-iam-policy-binding SERVICO --member="allUsers" --role="roles/run.invoker"'
      }
    ]
  },
  {
    id: 'api-oauth',
    title: 'Chaves de API & OAuth 2.0',
    icon: 'Key',
    description: 'Configuração de chaves de API do Google Cloud, ecrã de consentimento OAuth e escopos.',
    commonIssues: [
      {
        problem: 'Origin Redirect URI Mismatch',
        symptom: 'redirect_uri_mismatch no ecrã de login do Google.',
        solution: 'Adicione a URL exata do seu domínio/Applet em "Authorized redirect URIs" e "Authorized JavaScript origins" nas credenciais OAuth da Google Cloud Console.',
      },
      {
        problem: 'API Not Enabled (403 API Has Not Been Used)',
        symptom: 'API [name] has not been used in project before or it is disabled.',
        solution: 'Ative a API desejada no painel "APIs & Services" > "Library" da Google Cloud Console.',
        command: 'gcloud services enable vision.googleapis.com cloudresourcemanager.googleapis.com'
      }
    ]
  },
  {
    id: 'firestore-sql',
    title: 'Firestore & Cloud SQL',
    icon: 'Database',
    description: 'Conexão a bases de dados, regras de segurança do Firestore e IPs do Cloud SQL.',
    commonIssues: [
      {
        problem: 'Regras de Segurança Negadas no Firestore',
        symptom: 'FirebaseError: Missing or insufficient permissions.',
        solution: 'Atualize as regras no firestore.rules para permitir leitura/escrita autenticada aos utilizadores.',
        command: 'match /databases/{database}/documents { match /{document=**} { allow read, write: if request.auth != null; } }'
      },
      {
        problem: 'Falha de Conexão Cloud SQL Proxy',
        symptom: 'connect ECONNREFUSED ou timeout ao ligar ao PostgreSQL/MySQL.',
        solution: 'Utilize o Cloud SQL Auth Proxy ou conectores de IP privado VPC dentro do Cloud Run.',
      }
    ]
  },
  {
    id: 'vertex-gemini',
    title: 'Gemini API & Vertex AI',
    icon: 'Cpu',
    description: 'Integração de modelos Gemini 2.5/1.5, quotas da API e autenticação no servidor.',
    commonIssues: [
      {
        problem: 'API Key vs Vertex AI Credentials',
        symptom: 'Quota exceeded (429) ou Invalid Authentication Credential.',
        solution: 'Para chamadas do SDK @google/genai com GEMINI_API_KEY, certifique-se de que a chamada é realizada no lado do servidor (Node.js/Express) para proteger a chave secretamente.',
      }
    ]
  }
];
