# API Gateway

O API Gateway é o ponto central de entrada para as requisições dos microsserviços do sistema bancário. Ele atua como um proxy reverso, roteando as chamadas para os serviços de usuários (`client-service`) e transações (`transaction-service`), além de implementar a autenticação via AWS Cognito.

---

## Funcionalidades principais

### Proxy para microsserviços

- Roteia chamadas para `/api/users` e `/api/transactions` para os serviços respectivos.
- Roteia chamadas para `/api/auth` para o serviço de clientes, que contém as rotas públicas de autenticação (`login`, `register`, etc).
- Possui rota específica `/api/users/profile-picture` protegida para atualização da foto do usuário.

### Autenticação e Autorização

- Implementa autenticação via middleware que verifica o token JWT Bearer usando AWS Cognito.
- Middleware utiliza o `CognitoAuthProvider` para validar e decodificar o token, extraindo as informações do usuário (ID e email).
- Adiciona os dados do usuário nos headers (`x-user-id` e `x-user-email`) para uso downstream nos microsserviços.
- Permite rotas públicas para autenticação, como login e registro, sem exigir token.

---

## Tecnologias e ferramentas

- Node.js com Express para servidor HTTP e roteamento
- express-http-proxy para proxy reverso e roteamento das requisições
- AWS Cognito para autenticação via JWT
- jsonwebtoken e jwks-rsa para validação e verificação dos tokens JWT
- TypeScript para tipagem estática e organização do código

