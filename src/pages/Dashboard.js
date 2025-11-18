import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Form from "../components/Form";
import Grid from "../components/Grid";
import styled from "styled-components";
import axios from "axios";

const api = axios.create({
  baseURL: "https://crud-cad-funcionario-api.on2render.com",
});

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const WelcomeTitle = styled.h2`
  margin: 0;
  color: #2c73d2;
  font-size: 24px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionBtn = styled.button`
  background: ${(props) => (props.danger ? "#e74c3c" : "#2c73d2")};
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.danger ? "#c0392b" : "#1a5bb8")};
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 20px 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 15px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background-color: #fafafa;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: #2c73d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(44, 115, 210, 0.15);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #2c73d2;
  font-weight: bold;
  pointer-events: none;
`;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [onEdit, setOnEdit] = useState(null);
  const navigate = useNavigate();
  const referer = JSON.parse(localStorage.getItem("referer"));

  const getUsers = useCallback(async () => {
  if (!referer?.id) return;
  try {
    const res = await api.get(`/users/referer/${referer.id}`); // ← rota correta
    setUsers(res.data || []);
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    toast.error("Erro ao carregar dados");
  }
}, [referer?.id]);

  useEffect(() => {
    if (!referer) {
      navigate("/");
    } else {
      getUsers();
    }
  }, [referer, navigate, getUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    return users.filter((user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("referer");
    navigate("/");
  };

  if (!referer) return null;

  return (
    <Container>
      <Header>
        <WelcomeTitle>Bem-vindo, {referer.nome}!</WelcomeTitle>
        <ButtonGroup>
          <ActionBtn onClick={() => navigate("/admin/register")}>
            + Novo Admin
          </ActionBtn>
          <ActionBtn danger onClick={handleLogout}>
            Sair
          </ActionBtn>
        </ButtonGroup>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Pesquisar funcionário por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon>Search</SearchIcon>
      </SearchContainer>

      <Form
        onEdit={onEdit}
        setOnEdit={setOnEdit}
        getUsers={getUsers}
        refererId={referer.id}
      />

      <Grid users={filteredUsers} setUsers={setUsers} setOnEdit={setOnEdit} />
    </Container>
  );
};

export default Dashboard;
