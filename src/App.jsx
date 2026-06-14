import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:8080/courses'

function App() {
  const [courses, setCourses] = useState([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [instructor, setInstructor] = useState('')

  // Which course is being edited, and the edited values
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ code: '', name: '', instructor: '' })

  async function loadCourses() {
    const response = await fetch(API)
    const data = await response.json()
    setCourses(data)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  async function addCourse(event) {
    event.preventDefault()
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, instructor })
    })
    setCode('')
    setName('')
    setInstructor('')
    loadCourses()
  }

  async function deleteCourse(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    loadCourses()
  }

  // Enter edit mode for a course: remember its id and pre-fill the edit values
  function startEdit(course) {
    setEditingId(course.id)
    setEditValues({ code: course.code, name: course.name, instructor: course.instructor })
  }

  // Save the edited course via PUT
  async function saveEdit(id) {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues)
    })
    setEditingId(null)
    loadCourses()
  }

  return (
      <div style={{ maxWidth: 760, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#E8197A' }}>Course Scheduler</h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
          <thead>
          <tr>
            <th style={th}>Code</th>
            <th style={th}>Name</th>
            <th style={th}>Instructor</th>
            <th style={th}></th>
          </tr>
          </thead>
          <tbody>
          {courses.map(course => (
              <tr key={course.id}>
                {editingId === course.id ? (
                    // EDIT MODE: this row shows input fields
                    <>
                      <td style={td}><input value={editValues.code} onChange={e => setEditValues({ ...editValues, code: e.target.value })} style={editInput} /></td>
                      <td style={td}><input value={editValues.name} onChange={e => setEditValues({ ...editValues, name: e.target.value })} style={editInput} /></td>
                      <td style={td}><input value={editValues.instructor} onChange={e => setEditValues({ ...editValues, instructor: e.target.value })} style={editInput} /></td>
                      <td style={td}>
                        <button onClick={() => saveEdit(course.id)} style={rowBtn}>Save</button>
                        <button onClick={() => setEditingId(null)} style={deleteBtn}>Cancel</button>
                      </td>
                    </>
                ) : (
                    // DISPLAY MODE: this row shows plain text
                    <>
                      <td style={td}>{course.code}</td>
                      <td style={td}>{course.name}</td>
                      <td style={td}>{course.instructor}</td>
                      <td style={td}>
                        <button onClick={() => startEdit(course)} style={rowBtn}>Edit</button>
                        <button onClick={() => deleteCourse(course.id)} style={deleteBtn}>Delete</button>
                      </td>
                    </>
                )}
              </tr>
          ))}
          </tbody>
        </table>

        <form onSubmit={addCourse} style={{ marginTop: 30, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code (e.g. CSCI 2110)" required style={input} />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required style={input} />
          <input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Instructor" required style={input} />
          <button type="submit" style={addBtn}>Add Course</button>
        </form>
      </div>
  )
}

const th = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd', background: '#f5f5f5' }
const td = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd' }
const input = { padding: 8, border: '1px solid #ccc', borderRadius: 4 }
const editInput = { padding: 4, border: '1px solid #ccc', borderRadius: 4, width: '90%' }
const addBtn = { padding: '8px 16px', background: '#E8197A', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }
const rowBtn = { padding: '4px 10px', background: '#E8197A', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em', marginRight: 4 }
const deleteBtn = { padding: '4px 10px', background: '#888', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em' }

export default App