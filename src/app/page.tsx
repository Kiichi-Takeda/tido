'use client'

import { useState, useEffect } from 'react'

interface Todo {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)

  // TODO一覧を取得
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 新しいTODOを追加
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo }),
      })
      const data = await response.json()
      setTodos([data, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
    setLoading(false)
  }

  // TODOを更新
  const toggleTodo = async (todo: Todo) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todo.id,
          title: todo.title,
          completed: !todo.completed,
        }),
      })
      const data = await response.json()
      setTodos(todos.map(t => (t.id === data.id ? data : t)))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  // TODOを削除
  const deleteTodo = async (id: string) => {
    try {
      await fetch('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-600 mb-8 text-center">
          TODOアプリ
        </h1>

        {/* 新規TODO追加フォーム */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="新しいTODOを入力..."
              className="flex-1 p-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? '追加中...' : '追加'}
            </button>
          </div>
        </form>

        {/* TODOリスト */}
        <div className="space-y-4">
          {todos.map(todo => (
            <div
              key={todo.id}
              className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                />
                <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
