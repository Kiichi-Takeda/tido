'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Category {
  id: string
  name: string
  color: string
}

interface Todo {
  id: string
  title: string
  completed: boolean
  created_at: string
  due_date: string | null
  category_id: string | null
  categories: Category | null
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#000000' })

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

  // カテゴリー一覧を取得
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchTodos()
    fetchCategories()
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
        body: JSON.stringify({
          title: newTodo,
          due_date: selectedDate,
          category_id: selectedCategory || null,
        }),
      })
      const data = await response.json()
      setTodos([data, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
    setLoading(false)
  }

  // 新しいカテゴリーを追加
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })
      const data = await response.json()
      setCategories([...categories, data])
      setNewCategory({ name: '', color: '#000000' })
    } catch (error) {
      console.error('Error adding category:', error)
    }
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
          due_date: todo.due_date,
          category_id: todo.category_id,
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

  // 日付でフィルタリングされたTODOを取得
  const filteredTodos = todos.filter(todo => {
    if (!selectedDate) return true
    return todo.due_date === selectedDate
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-600 mb-8 text-center">
          TODOアプリ
        </h1>

        {/* カテゴリー追加フォーム */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-purple-600 mb-4">カテゴリー追加</h2>
          <form onSubmit={addCategory} className="flex gap-4">
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="カテゴリー名"
              className="flex-1 p-2 rounded-lg border border-purple-300"
            />
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              className="w-12 h-12 rounded-lg"
            />
            <button
              type="submit"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              追加
            </button>
          </form>
        </div>

        {/* 新規TODO追加フォーム */}
        <form onSubmit={addTodo} className="bg-white p-4 rounded-lg shadow-lg mb-8">
          <div className="space-y-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="新しいTODOを入力..."
              className="w-full p-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 rounded-lg border border-purple-300"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-purple-300"
              >
                <option value="">カテゴリーを選択</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {loading ? '追加中...' : '追加'}
              </button>
            </div>
          </div>
        </form>

        {/* TODOリスト */}
        <div className="space-y-4">
          {filteredTodos.map(todo => (
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
                <div>
                  <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                    {todo.title}
                  </span>
                  {todo.due_date && (
                    <span className="ml-4 text-sm text-gray-500">
                      {format(new Date(todo.due_date), 'M月d日 (E)', { locale: ja })}
                    </span>
                  )}
                  {todo.categories && (
                    <span
                      className="ml-4 px-2 py-1 text-sm rounded-full"
                      style={{ backgroundColor: todo.categories.color + '20', color: todo.categories.color }}
                    >
                      {todo.categories.name}
                    </span>
                  )}
                </div>
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
