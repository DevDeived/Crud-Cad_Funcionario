import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import md5 from "md5";
import api from "../lib/api";  // AQUI ESTÁ A CHAVE DO SUCESSO

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
`;

const LoginBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 380px;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 24px;
  color: #2c73d2;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin: 10px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  &:focus {
    outline: none;
    border-color: #2c73d2;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #2c73d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  &:hover { background: #1a5bb8; }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.get(`/referers/${email}`);  // usa a baseURL correta automaticamente
      const user = res.data;

      if (user && user.senha === md5(senha)) {
        localStorage.setItem("referer", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setError("Email ou senha incorretos");
      }
    } catch (err) {
      setError("Erro ao fazer login. Verifique o email ou a conexão.");
      console.error(err);
    }
  };

  return (
    <Container>
      <LoginBox>
        <Title>LOGIN PIX</Title>
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Button type="submit">Entrar</Button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </form>
      </LoginBox>
    </Container>
  );
};

export default Login;