import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../../lib/api";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
`;

const FormBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 24px;
  color: #2c73d2;
  font-weight: 700;
  font-size: 26px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin: 10px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border 0.2s;

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
  transition: background 0.2s;

  &:hover {
    background: #1a5bb8;
  }
`;

const BackLink = styled.p`
  margin-top: 20px;
  color: #2c73d2;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
`;

const RegisterAdmin = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nome || !email || !senha || !confirmarSenha) {
      setError("Preencha todos os campos");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      // NÃO FAZ md5 AQUI! O BACK-END JÁ FAZ!
      const res = await api.post("/referers", {
        nome,
        email: email.toLowerCase().trim(),
        senha, // ← SENHA PURA
      });

      // Loga automaticamente após cadastro
      localStorage.setItem("referer", JSON.stringify(res.data));
      setSuccess("Administrador cadastrado com sucesso!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao cadastrar. Tente outro email.";
      setError(msg);
    }
  };

  return (
    <Container>
      <FormBox>
        <Title>Cadastrar Novo Admin</Title>
        <form onSubmit={handleRegister}>
          <Input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <Button type="submit">Cadastrar Admin</Button>

          {error && <p style={{ color: "red", marginTop: "12px", fontSize: "14px" }}>{error}</p>}
          {success && <p style={{ color: "green", marginTop: "12px", fontWeight: "600" }}>{success}</p>}
        </form>

        <BackLink onClick={() => navigate("/")}>
          ← Voltar para Login
        </BackLink>
      </FormBox>
    </Container>
  );
};

export default RegisterAdmin;