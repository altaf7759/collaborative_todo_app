import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/userContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { Check, PencilLine, Plus, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/button";

const backend_url = import.meta.env.VITE_BACKEND_BASE_URL;

const TodoDetails = () => {
      const { theme, user } = useAppContext();
      const { todoId } = useParams();
      const navigate = useNavigate();

      const [title, setTitle] = useState("");
      const [subTodoContent, setSubTodoContent] = useState("");
      const [todo, setTodo] = useState({});
      const [loading, setLoading] = useState(false);
      const [isEditingTitle, setIsEditingTitle] = useState(false);
      const [editingSubTodoId, setEditingSubTodoId] = useState(null);
      const [wantToDelete, setWantToDelete] = useState(false);
      const [isDeletingTodo, setIsDeletingTodo] = useState(false);
      const [showModal, setShowModal] = useState(false);
      const [isSubTodoCreating, setISSubTodoCreating] = useState(false);
      const [inviteEmail, setInviteEmail] = useState("");
      const [isInviting, setIsInviting] = useState(false);
      const [loadingSubTodoId, setLoadingSubTodoId] = useState(null);

      const textColor = theme.mode === "dark" ? "text-white" : "text-[#1f2937]";
      const bg = theme.mode === "dark" ? "bg-[#2c2d2d]" : "bg-[#f7f7f7]";

      /* ───────── AUTH ───────── */
      useEffect(() => {
            if (!user) navigate("/auth");
      }, [user]);

      /* ───────── FETCH TODO ───────── */
      useEffect(() => {
            const getTodo = async () => {
                  setLoading(true);
                  try {
                        const { data } = await axios.get(
                              `${backend_url}/api/todo/get-todo-by-id/${todoId}`,
                              { withCredentials: true }
                        );
                        setTodo(data?.todo || {});
                        setTitle(data?.todo?.title || "");
                  } catch (error) {
                        alert(error?.response?.data?.message || "Something went wrong.");
                  } finally {
                        setLoading(false);
                  }
            };
            getTodo();
      }, [todoId]);

      /* ───────── PERMISSIONS ───────── */
      const isAdmin = () => todo.createdBy?._id === user?._id;

      const collaborator = todo.collaborators?.find(
            (c) => c?.user?._id === user?._id
      );

      const collaboratorWrite = collaborator?.permission === "write";
      const collaboratorRead = collaborator?.permission === "read";

      const isSubCreator = (st) => st.createdBy?._id === user?._id;

      const canEditTodoTitle = () => isAdmin();
      const canDeleteTodo = () => isAdmin();
      const canInvite = () => isAdmin();

      const canCreateSubTodo = () => isAdmin() || collaboratorWrite;

      const canEditSubTodo = (st) => {
            if (isAdmin()) return true;
            if (collaboratorWrite) return true;
            return false;
      };

      const canDeleteSubTodo = (st) => {
            if (isAdmin()) return true;
            if (collaboratorWrite && isSubCreator(st)) return true;
            return false;
      };

      /* ───────── API HANDLERS ───────── */

      const updateTodoHandler = async () => {
            setIsEditingTitle(false);
            try {
                  if (!title) return alert("Title is required to update todo");
                  const { data } = await axios.patch(
                        `${backend_url}/api/todo/update/${todoId}`,
                        { title },
                        { withCredentials: true }
                  );
                  setTitle(data?.updatedTodo?.title);
                  setTodo((prev) => ({ ...prev, title: data?.updatedTodo.title }));
                  alert(data?.message);
            } catch (error) {
                  alert(error?.response?.data?.message || "Error while updating todo");
            }
      };

      const deleteTodoHandler = async () => {
            setIsDeletingTodo(true);
            try {
                  const { data } = await axios.delete(
                        `${backend_url}/api/todo/delete/${todoId}`,
                        { withCredentials: true }
                  );
                  alert(data?.message);
                  navigate("/");
            } catch (error) {
                  alert(error?.response?.data?.message || "Failed to delete todo");
            } finally {
                  setIsDeletingTodo(false);
            }
      };

      const updateSubTodoHandler = async (subTodoId) => {
            try {
                  const { data } = await axios.put(
                        `${backend_url}/api/sub-todo/update/${subTodoId}`,
                        { content: subTodoContent },
                        { withCredentials: true }
                  );
                  setTodo((prev) => ({
                        ...prev,
                        subTodos: prev.subTodos.map((st) =>
                              st._id === subTodoId
                                    ? { ...st, content: data.subTodo.content }
                                    : st
                        ),
                  }));
                  setEditingSubTodoId(null);
                  setSubTodoContent("");
                  alert(data?.message);
            } catch (error) {
                  alert(error?.response?.data?.message || "Failed to update sub todo");
            }
      };

      const deleteSubTodoHandler = async (subTodoId) => {
            try {
                  const { data } = await axios.delete(
                        `${backend_url}/api/sub-todo/delete/${subTodoId}`,
                        { withCredentials: true }
                  );
                  setTodo((prev) => ({
                        ...prev,
                        completed: data?.todoCompleted,
                        subTodos: prev.subTodos.filter((st) => st._id !== subTodoId),
                  }));
                  alert(data?.message);
            } catch (error) {
                  alert(error?.response?.data?.message || "Error while deleting sub todo");
            }
      };

      const addSubTodo = async () => {
            setISSubTodoCreating(true);
            try {
                  const { data } = await axios.post(
                        `${backend_url}/api/sub-todo/create/${todoId}`,
                        { content: subTodoContent },
                        { withCredentials: true }
                  );
                  setTodo((prev) => ({
                        ...prev,
                        completed: data?.todoCompleted,
                        subTodos: [...(prev.subTodos || []), data.subTodo],
                  }));
                  alert(data?.message);
                  setSubTodoContent("");
                  setShowModal(false);
            } catch (error) {
                  alert(error?.response?.data?.message || "Failed to create sub todo");
            } finally {
                  setISSubTodoCreating(false);
            }
      };

      /* ✅ FIXED COMPLETE SUB TODO */
      const completeSubTodo = async (subTodoId, currentStatus) => {
            setLoadingSubTodoId(subTodoId);
            try {
                  const { data } = await axios.patch(
                        `${backend_url}/api/sub-todo/complete/${subTodoId}`,
                        { complete: !currentStatus },
                        { withCredentials: true }
                  );

                  setTodo((prev) => ({
                        ...prev,
                        completed: data.todoCompleted,
                        subTodos: prev.subTodos.map((st) =>
                              st._id === subTodoId
                                    ? { ...st, completed: !currentStatus }
                                    : st
                        ),
                  }));
                  alert(data?.message)
            } catch (error) {
                  alert(error?.response?.data?.message || "Error completing sub todo");
            } finally {
                  setLoadingSubTodoId(null);
            }
      };

      const inviteUser = async () => {
            setIsInviting(true)
            try {
                  const { data } = await axios.post(`${backend_url}/api/todo/invite/send/${todoId}`, { email: inviteEmail }, { withCredentials: true })
                  const newCollaborator = data.todo.collaborators[data.todo.collaborators.length - 1]
                  const populatedCollaborator = { ...newCollaborator, user: data.user, }
                  setTodo((prev) => (
                        { ...prev, collaborators: [...(prev.collaborators || []), populatedCollaborator], }
                  ))
                  alert(data.message); setInviteEmail("")
            } catch (error) {
                  console.log(error); alert(error?.response?.data?.message || "Failed to invite user")
            } finally {
                  setIsInviting(false)
            }
      }

      if (loading) {
            return (
                  <div
                        className={`h-screen flex items-center justify-center ${bg} ${textColor}`}
                  >
                        Loading...
                  </div>
            );
      }

      return (
            <div className={`max-w-[1200px] m-auto p-4 ${textColor}`}>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-20">
                        {/* Left side */}
                        <div>
                              {/* MAIN TODO TITLE */}
                              <div className="flex gap-3 items-center">
                                    {isEditingTitle ? (
                                          <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="text-xl w-[80%] max-w-[450px] sm:text-2xl md:text-3xl font-bold p-2 border rounded"
                                          />
                                    ) : (
                                          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                                                {todo.title}
                                          </h1>
                                    )}

                                    {(canEditTodoTitle() || canDeleteTodo()) && (
                                          <div className="flex items-center gap-2">
                                                {canEditTodoTitle() &&
                                                      (isEditingTitle ? (
                                                            <Check size={28} onClick={updateTodoHandler} />
                                                      ) : (
                                                            <PencilLine
                                                                  size={18}
                                                                  onClick={() => setIsEditingTitle(true)}
                                                            />
                                                      ))}
                                                {canDeleteTodo() && (
                                                      <Trash2 size={18} onClick={() => setWantToDelete(true)} />
                                                )}
                                          </div>
                                    )}

                                    {/* Delete todo pop up */}
                                    {wantToDelete && (
                                          <div className="fixed inset-0 z-50 flex justify-center items-center">
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                                                <div
                                                      className={`${theme.mode === "dark"
                                                            ? "bg-[#393a3a]"
                                                            : "bg-[#d4dce5]"
                                                            } ${theme.mode === "dark" ? "text-white" : "text-[#4b5563]"
                                                            } relative z-10 w-[90%] max-w-md rounded-lg p-6 flex flex-col gap-4`}
                                                >
                                                      <div className="flex justify-between items-center">
                                                            <h1 className="text-xl font-bold">Delete Todo</h1>
                                                            <X
                                                                  className="cursor-pointer"
                                                                  onClick={() => setWantToDelete(false)}
                                                            />
                                                      </div>
                                                      <p className="text-sm opacity-80">
                                                            Do you really want to delete this todo
                                                      </p>
                                                      <div className="flex justify-end">
                                                            <Button
                                                                  className="w-fit cursor-pointer"
                                                                  onClick={deleteTodoHandler}
                                                            >
                                                                  {isDeletingTodo ? "Deleting" : "Delete"}
                                                            </Button>
                                                      </div>
                                                </div>
                                          </div>
                                    )}
                              </div>

                              {/* Add subTodo Button */}
                              {canCreateSubTodo() && (
                                    <div className="mt-5">
                                          <Button
                                                onClick={() => setShowModal(true)}
                                                className="cursor-pointer"
                                          >
                                                <Plus /> Add Sub Todo
                                          </Button>
                                    </div>
                              )}

                              {/* Add SubTodo pop up */}
                              {showModal && (
                                    <div className="fixed inset-0 z-50 flex justify-center items-center">
                                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                                          <div
                                                className={`relative z-10 w-[90%] max-w-md rounded-lg p-6 flex flex-col gap-4 ${theme.mode === "dark"
                                                      ? "bg-[#393a3a] text-white"
                                                      : "bg-[#d4dce5] text-[#4b5563]"
                                                      }`}
                                          >
                                                <div className="flex justify-between items-center">
                                                      <h1 className="text-xl font-bold">Add Sub Todo</h1>
                                                      <X
                                                            className="cursor-pointer"
                                                            onClick={() => setShowModal(false)}
                                                      />
                                                </div>

                                                <input
                                                      type="text"
                                                      placeholder="Sub Todo title..."
                                                      value={subTodoContent}
                                                      onChange={(e) => setSubTodoContent(e.target.value)}
                                                      className="w-full p-2 rounded border"
                                                />

                                                <div className="flex justify-end">
                                                      <Button onClick={addSubTodo} className="cursor-pointer">
                                                            {isSubTodoCreating ? "Adding..." : "Add"}
                                                      </Button>
                                                </div>
                                          </div>
                                    </div>
                              )}

                              {/* Show Todo completed */}
                              {
                                    todo.completed && <p className="mt-5">This todo has been completed</p>
                              }

                              {/* SUB-TODOS */}
                              <div className="mt-6 space-y-2">
                                    {todo.subTodos?.length > 0 ? (
                                          todo.subTodos.map((st) => (
                                                <div
                                                      key={st._id}
                                                      className={`flex justify-between items-center gap-2 p-3 rounded ${bg} ${textColor}`}
                                                >
                                                      <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={st.completed} disabled={
                                                                  !canEditSubTodo(st) || loadingSubTodoId === st._id
                                                            } onChange={() => completeSubTodo(st._id, st.completed)} />
                                                            {editingSubTodoId === st._id ? (
                                                                  <input
                                                                        type="text"
                                                                        value={subTodoContent}
                                                                        onChange={(e) => setSubTodoContent(e.target.value)}
                                                                        className="border p-1 rounded"
                                                                  />
                                                            ) : (
                                                                  <p
                                                                        className={`${st.completed ? "line-through opacity-60" : ""
                                                                              }`}
                                                                  >
                                                                        {st.content}
                                                                  </p>

                                                            )}
                                                      </div>

                                                      <div className="flex items-center gap-2">
                                                            {canEditSubTodo(st) && !st.completed &&
                                                                  (editingSubTodoId === st._id ? (
                                                                        <Check
                                                                              size={28}
                                                                              onClick={() => updateSubTodoHandler(st._id)}
                                                                        />
                                                                  ) : (
                                                                        <PencilLine
                                                                              size={18}
                                                                              onClick={() => {
                                                                                    setEditingSubTodoId(st._id);
                                                                                    setSubTodoContent(st.content);
                                                                              }}
                                                                        />
                                                                  ))}

                                                            {canDeleteSubTodo(st) && !st.completed && (
                                                                  <Trash2
                                                                        size={18}
                                                                        onClick={() => deleteSubTodoHandler(st._id)}
                                                                  />
                                                            )}
                                                      </div>
                                                </div>
                                          ))
                                    ) : (
                                          <p>No subTodos yet</p>
                                    )}
                              </div>
                        </div>

                        {/* Right side */}
                        <div className="md:mt-0">
                              <h3 className={`text-md font-semibold ${textColor} mb-3`}>Invite{!canInvite() && "d"} peoples to collaborate on this todo</h3>
                              {/* Invite collaborators */}
                              {canInvite() && (
                                    <div className="flex gap-3">
                                          <input
                                                type="email"
                                                placeholder="Enter email..."
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className={`border px-3 rounded w-full ${theme.mode === "dark"
                                                      ? "bg-[#2c2d2d] text-white placeholder-gray-400"
                                                      : "bg-white text-black placeholder-gray-500"
                                                      }`}
                                          />
                                          <Button onClick={inviteUser}>
                                                {isInviting ? "Inviting..." : "Invite"}
                                          </Button>
                                    </div>
                              )}

                              {/* Collaborators */}
                              <div>
                                    <h3 className={`text-lg font-semibold ${textColor} mt-10 mb-5`}>
                                          Collaborators
                                    </h3>

                                    {todo.collaborators?.length > 0 ? (
                                          todo.collaborators.map((c) => {
                                                const isAdmin = todo.createdBy?._id === user?._id; // check if current user is admin

                                                const handlePermissionChange = async (newPermission) => {
                                                      try {
                                                            const { data } = await axios.put(
                                                                  `${backend_url}/api/todo/update/permission/${todo._id}`,
                                                                  {
                                                                        collaboratorEmail: c?.email,
                                                                        permission: newPermission,
                                                                  },
                                                                  { withCredentials: true }
                                                            );

                                                            // update local state
                                                            setTodo((prev) => ({
                                                                  ...prev,
                                                                  collaborators: prev.collaborators.map((col) =>
                                                                        col?.user?._id === c?.user?._id ? { ...col, permission: newPermission } : col
                                                                  ),
                                                            }));

                                                            alert(data.message);
                                                      } catch (error) {
                                                            console.log(error);
                                                            alert(error?.response?.data?.message || "Failed to update permission");
                                                      }
                                                };

                                                return (
                                                      <div
                                                            key={c?.user?._id || c._id}
                                                            className="border-b mb-3 p-3 flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-2"
                                                      >
                                                            {/* User Info */}
                                                            {c?.user ? (
                                                                  <div className="flex-1">
                                                                        <p className="font-medium">{c.user.userName}</p>
                                                                        <p className="text-sm text-gray-500">{c.email}</p>
                                                                  </div>
                                                            ) : (
                                                                  <div>
                                                                        <p className="text-sm text-gray-400 italic">User no longer exists or not registered with on the app</p>
                                                                        <p className="text-sm text-gray-500">{c.email}</p>
                                                                  </div>
                                                            )}

                                                            {/* Permission Status */}
                                                            {c?.user && (
                                                                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                                                        <p className="text-sm">{c.status || "Status"}</p>
                                                                        <label className="flex items-center gap-1 text-sm">
                                                                              Read
                                                                              <input
                                                                                    type="checkbox"
                                                                                    checked={c.permission === "read" || c.permission === "write"}
                                                                                    disabled={!isAdmin}
                                                                                    onChange={() => {
                                                                                          // If "write" is currently selected, switching off read doesn't make sense
                                                                                          // So we only allow toggling between read and write for admin
                                                                                          const newPermission =
                                                                                                c.permission === "write" ? "write" : "read";
                                                                                          handlePermissionChange(newPermission);
                                                                                    }}
                                                                                    className="w-4 h-4"
                                                                              />
                                                                        </label>

                                                                        <label className="flex items-center gap-1 text-sm">
                                                                              Write
                                                                              <input
                                                                                    type="checkbox"
                                                                                    checked={c.permission === "write"}
                                                                                    disabled={!isAdmin}
                                                                                    onChange={() =>
                                                                                          handlePermissionChange(c.permission === "write" ? "read" : "write")
                                                                                    }
                                                                                    className="w-4 h-4"
                                                                              />
                                                                        </label>
                                                                  </div>
                                                            )}
                                                      </div>
                                                );
                                          })
                                    ) : (
                                          <p className="text-sm text-gray-500">No collaborators yet</p>
                                    )}
                              </div>

                        </div>
                  </div>
            </div>
      );
};

export default TodoDetails;
