import { useState, useEffect } from 'react'
import './App.css'

const COURSES_API = 'http://localhost:8080/courses'
const STUDENTS_API = 'http://localhost:8080/students'

function App() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])

  // Course form
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [instructor, setInstructor] = useState('')

  // Course edit
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ code: '', name: '', instructor: '' })

  // Student form
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')

  // --- Loaders ---
  async function loadCourses() {
    const res = await fetch(COURSES_API)
    setCourses(await res.json())
  }
  async function loadStudents() {
    const res = await fetch(STUDENTS_API)
    setStudents(await res.json())
  }

  useEffect(() => {
    loadCourses()
    loadStudents()
  }, [])

  // --- Course actions ---
  async function addCourse(event) {
    event.preventDefault()
    await fetch(COURSES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, instructor })
    })
    setCode(''); setName(''); setInstructor('')
    loadCourses()
  }
  async function deleteCourse(id) {
    await fetch(`${COURSES_API}/${id}`, { method: 'DELETE' })
    loadCourses()
  }
  function startEdit(course) {
    setEditingId(course.id)
    setEditValues({ code: course.code, name: course.name, instructor: course.instructor })
  }
  async function saveEdit(id) {
    await fetch(`${COURSES_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues)
    })
    setEditingId(null)
    loadCourses()
  }

  // --- Student actions ---
  async function addStudent(event) {
    event.preventDefault()
    await fetch(STUDENTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: studentName, email: studentEmail })
    })
    setStudentName(''); setStudentEmail('')
    loadStudents()
  }
  async function deleteStudent(id) {
    await fetch(`${STUDENTS_API}/${id}`, { method: 'DELETE' })
    loadStudents()
  }
  // Enroll a student in a course
  async function enroll(studentId, courseId) {
    if (!courseId) return // ignore the empty "-- enroll --" option
    await fetch(`${STUDENTS_API}/${studentId}/enroll/${courseId}`, { method: 'POST' })
    loadStudents()
  }

  return (
      <div style={{ maxWidth: 760, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#E8197A' }}>Course Scheduler</h1>

        {/* COURSES */}
        <h2>Courses</h2>
        <table style={table}>
          <thead>
          <tr><th style={th}>Code</th><th style={th}>Name</th><th style={th}>Instructor</th><th style={th}></th></tr>
          </thead>
          <tbody>
          {courses.map(course => (
              <tr key={course.id}>
                {editingId === course.id ? (
                    <>
                      <td style={td}><input value={editValues.code} onChange={e => setEditValues({ ...editValues, code: e.target.value })} style={editInput} /></td>
                      <td style={td}><input value={editValues.name} onChange={e => setEditValues({ ...editValues, name: e.target.value })} style={editInput} /></td>
                      <td style={td}><input value={editValues.instructor} onChange={e => setEditValues({ ...editValues, instructor: e.target.value })} style={editInput} /></td>
                      <td style={td}>
                        <button onClick={() => saveEdit(course.id)} style={rowBtn}>Save</button>
                        <button onClick={() => setEditingId(null)} style={greyBtn}>Cancel</button>
                      </td>
                    </>
                ) : (
                    <>
                      <td style={td}>{course.code}</td>
                      <td style={td}>{course.name}</td>
                      <td style={td}>{course.instructor}</td>
                      <td style={td}>
                        <button onClick={() => startEdit(course)} style={rowBtn}>Edit</button>
                        <button onClick={() => deleteCourse(course.id)} style={greyBtn}>Delete</button>
                      </td>
                    </>
                )}
              </tr>
          ))}
          </tbody>
        </table>

        <form onSubmit={addCourse} style={formStyle}>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code (e.g. CSCI 2110)" required style={input} />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required style={input} />
          <input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Instructor" required style={input} />
          <button type="submit" style={addBtn}>Add Course</button>
        </form>

        {/* STUDENTS */}
        <h2 style={{ marginTop: 50 }}>Students</h2>
        <table style={table}>
          <thead>
          <tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Enrolled Courses</th><th style={th}>Enroll</th><th style={th}></th></tr>
          </thead>
          <tbody>
          {students.map(student => (
              <tr key={student.id}>
                <td style={td}>{student.name}</td>
                <td style={td}>{student.email}</td>
                <td style={td}>
                  {student.courses && student.courses.length > 0
                      ? student.courses.map(c => c.code).join(', ')
                      : <span style={{ color: '#999' }}>none</span>}
                </td>
                <td style={td}>
                  <select onChange={e => enroll(student.id, e.target.value)} value="" style={editInput}>
                    <option value="">-- enroll --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.code}</option>
                    ))}
                  </select>
                </td>
                <td style={td}>
                  <button onClick={() => deleteStudent(student.id)} style={greyBtn}>Delete</button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>

        <form onSubmit={addStudent} style={formStyle}>
          <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Student name" required style={input} />
          <input value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="Email" required style={input} />
          <button type="submit" style={addBtn}>Add Student</button>
        </form>
      </div>
  )
}

const table = { width: '100%', borderCollapse: 'collapse', marginTop: 20 }
const th = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd', background: '#f5f5f5' }
const td = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd' }
const formStyle = { marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }
const input = { padding: 8, border: '1px solid #ccc', borderRadius: 4 }
const editInput = { padding: 4, border: '1px solid #ccc', borderRadius: 4 }
const addBtn = { padding: '8px 16px', background: '#E8197A', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }
const rowBtn = { padding: '4px 10px', background: '#E8197A', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em', marginRight: 4 }
const greyBtn = { padding: '4px 10px', background: '#888', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em' }

export default App