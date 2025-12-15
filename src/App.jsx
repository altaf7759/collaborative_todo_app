import Navbar from "./components/Navbar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppContext } from "./context/userContext"
import { ArrowBigRightDash, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const backend_url = import.meta.env.VITE_BACKEND_BASE_URL;

function App() {
  const { user, theme } = useAppContext()
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [todoTitle, setTodoTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isTodosLoading, setIsTodosLoading] = useState(false)

  const textColor = theme.mode === "dark" ? "text-white" : "text-[#1f2937]"
  const bg = theme.mode === "dark" ? "bg-[#2c2d2d]" : "bg-[#f7f7f7]"

  useEffect(() => {
    if (!user) navigate("/auth")
  }, [user, navigate])

  useEffect(() => {
    const getAllTodos = async () => {
      setIsTodosLoading(true)
      try {
        const { data } = await axios.get(
          `${backend_url}/api/todo/get-all-for-home`,
          { withCredentials: true }
        )
        setTodos(data?.todos || [])
      } catch (error) {
        alert(error?.response?.data?.message || "Something went wrong.")
      } finally {
        setIsTodosLoading(false)
      }
    }

    getAllTodos()
  }, [])

  const addTodo = async () => {
    if (!todoTitle.trim()) return alert("Todo title required")

    setLoading(true)
    try {
      const { data } = await axios.post(
        `${backend_url}/api/todo/create`,
        { title: todoTitle },
        { withCredentials: true }
      )

      setTodos(prev => [...prev, data.todo])
      setTodoTitle("")
      setShowModal(false)
    } catch (error) {
      alert(error?.response?.data?.message || "Error try again")
    } finally {
      setLoading(false)
    }
  }

  const openTodo = (id) => navigate(`/todo/${id}`)

  if (isTodosLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${bg} ${textColor}`}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Navbar />

      {/* HEADER — ALWAYS VISIBLE */}
      <div className="max-w-[1200px] p-5 mt-1 m-auto flex justify-between items-end">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
            Welcome {user?.userName},
          </h1>
          <p className={`${textColor} text-sm sm:text-base`}>
            Find all todos
          </p>
        </div>

        <div
          className={`flex gap-1 items-center px-3 sm:px-5 py-2 rounded-2xl cursor-pointer
          ${theme.mode === "dark" ? "bg-[#393a3a] text-white" : "bg-[#d4dce5] text-[#4b5563]"}`}
          onClick={() => setShowModal(true)}
        >
          <Plus size={window.innerWidth < 470 ? 15 : 20} />
          Add Todo
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className={`relative z-10 w-[90%] max-w-md rounded-lg p-6 flex flex-col gap-4
            ${theme.mode === "dark" ? "bg-[#393a3a] text-white" : "bg-[#d4dce5] text-[#4b5563]"}`}>

            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Add Todo</h1>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </div>

            <input
              type="text"
              placeholder="Todo title..."
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
              className="w-full p-2 rounded border"
            />

            <div className="flex justify-end">
              <Button onClick={addTodo}>
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {todos.length === 0 && (
        <p className={`text-center mt-10 ${textColor}`}>
          No Todos Found
        </p>
      )}

      {/* TODO GRID */}
      {todos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 max-w-[1200px] m-auto p-5">
          {todos.map((todo) => (
            <Card key={todo._id}
              className={`${theme.mode === "dark" ? "bg-[#393a3a] text-white" : "bg-[#d4dce5] text-[#4b5563]"} border-0`}
            >
              <CardHeader>
                <CardTitle>{todo.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                {todo.subTodos?.map((st) => (
                  <div key={st._id} className="flex gap-2">
                    <ArrowBigRightDash />
                    <p>{st.content}</p>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button onClick={() => openTodo(todo._id)}>
                  Expand and see more
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export default App
