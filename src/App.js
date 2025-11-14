// src/App.js
import React, { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import Form from "./components/Form";
import Grid from "./components/Grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// === ESTILOS GLOBAIS (apenas 1 vez) ===
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background-color: #f5f5f5;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const Title = styled.h2`
  width: 100%;
  max-width: 1200px;
  text-align: center;
  color: #2c73d2;
  font-weight: 700;
  font-size: 28px;
  margin: 0;
  padding: 10px 0;
  border-bottom: 3px solid #2c73d2;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

function App() {
  const [users, setUsers] = useState([]);
  const [onEdit, setOnEdit] = useState(null);

  const getUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8800");
      const sorted = res.data.sort((a, b) => a.nome.localeCompare(b.nome));
      setUsers(sorted);
    } catch (error) {
      toast.error("Erro ao carregar funcionários.");
      console.error("Erro:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []); // Correto: sem setUsers no array

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>CADASTRO DE FUNCIONÁRIOS</Title>

        <Form onEdit={onEdit} setOnEdit={setOnEdit} getUsers={getUsers} />

        <Grid users={users} setUsers={setUsers} setOnEdit={setOnEdit} />

        <ToastContainer
          position="bottom-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Container>
    </>
  );
}

export default App;