import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import md5 from "md5";
import styled from "styled-components";

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

    if (senha.length < 3) {
      setError("A senha deve ter pelo menos 3 caracteres");
      return;
    }

    try {
    const res = await api.post("/referers", { // ← rota correta
      nome,
      email,
      senha: md5(senha),
    });

    localStorage.setItem("referer", JSON.stringify(res.data));
    setSuccess("Administrador cadastrado com sucesso!");
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (err) {
    setError(err.response?.data?.error || "Email já existe");
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
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
          <Button type="submit">Cadastrar Admin</Button>

          {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
          {success && (
            <p style={{ color: "green", marginTop: "12px" }}>{success}</p>
          )}
        </form>

        <BackLink onClick={() => navigate("/dashboard")}>
          ← Voltar ao Dashboard
        </BackLink>
      </FormBox>
    </Container>
  );
};

export default RegisterAdmin;
