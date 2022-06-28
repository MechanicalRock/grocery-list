import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { useGlobalUserContext } from "../context";
import TodoList from "../TodoList";
import toast, { Toaster } from "react-hot-toast";

export default function FeedbackForm() {
  const [todo, setTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState([{}]);
  const { user, setUser } = useGlobalUserContext();
  const [token, setToken] = useState("");
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  useEffect(() => {
    if (user) {
      setToken(user.signInUserSession.idToken.jwtToken);
      getTodos();
    }
  }, [user, token]);

  const errorMessage = () =>
    toast.error("Something went wrong, please try again later");
  const successMessage = (successMessage: string) =>
    toast.success(successMessage);

  const getTodos = () => {
    token &&
      fetch(
        "https://siqmpph34k.execute-api.ap-southeast-2.amazonaws.com/dev/todos",
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => setTodos(data.Items));
  };

  const saveTodo = () => {
    token &&
      fetch(
        "https://siqmpph34k.execute-api.ap-southeast-2.amazonaws.com/dev/todo",
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: todo,
          }),
        }
      )
        .then((res) => res.json())
        .then((message) => {
          message === "Todo created" ? successMessage(message) : errorMessage();
          getTodos();
        });
  };

  const deleteTodo = (id: string, createdAt: string) => {
    token &&
      fetch(
        "https://siqmpph34k.execute-api.ap-southeast-2.amazonaws.com/dev/todo",
        {
          method: "DELETE",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            createdAt: createdAt,
          }),
        }
      )
        .then((res) => res.json())
        .then((message) => {
          message === "Deleted" ? successMessage(message) : errorMessage();
          getTodos();
        })
        .catch((err) => console.log(err));
  };

  const editTodo = (id: string, createdAt: string, editedTodo: string) => {
    token &&
      fetch(
        "https://siqmpph34k.execute-api.ap-southeast-2.amazonaws.com/dev/todo",
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            createdAt: createdAt,
            body: editedTodo,
          }),
        }
      )
        .then((res) => res.json())
        .then((message) => {
          message === "Changed Todo" ? successMessage(message) : errorMessage();
          getTodos();
        });
  };

  const submit = () => {
    setLoading(true);
    saveTodo();
    setTodo("");
    setLoading(false);
  };

  async function signOut() {
    try {
      await Auth.signOut();
      setUser(null);
      window.localStorage.setItem("auth", "false");
      window.location.reload();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  return (
    <>
      <Toaster />
      <>
        <Button onClick={signOut}>Sign Out</Button>
        <Grid
          container
          sx={{
            marginRight: "40px",
            marginLeft: "40px",
            marginTop: "40px",
            marginBottom: "40px",
          }}
        >
          <Grid item xs={12} textAlign={"center"}>
            <Typography variant="h4">Today I will:</Typography>
          </Grid>
          <Grid item xs={12} textAlign={"center"}>
            <Typography variant="body1">{`${dd}/${mm}/${yyyy}`}</Typography>
          </Grid>

          <Grid item xs={12} textAlign={"center"}>
            <TextField
              variant="outlined"
              label={"To do"}
              sx={{ width: "70%" }}
              value={todo}
              onChange={(event) => {
                setTodo(event?.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} textAlign={"center"} padding={"20px"}>
            <Button variant="contained" onClick={submit}>
              <Typography variant="body1">Add Todo</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} textAlign={"center"}>
            <TodoList
              data={todos}
              getTodos={getTodos}
              deleteTodo={deleteTodo}
              editTodo={editTodo}
            />
          </Grid>
        </Grid>
      </>

      {loading && (
        <>
          <Grid item xs={12} textAlign={"center"}>
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          </Grid>
        </>
      )}
    </>
  );
}
