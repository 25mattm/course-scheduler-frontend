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

  // Open rosters: { [courseId]: [students] } — multiple can be open at once
  const [openRosters, setOpenRosters] = useState({})

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
    async function loadAll() {
      await loadCourses()
      await loadStudents()
    }
    void loadAll()
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
    await loadCourses()
  }
  async function deleteCourse(id) {
    await fetch(`${COURSES_API}/${id}`, { method: 'DELETE' })
    setOpenRosters(prev => {  // close this course's roster if open
      const next = { ...prev }
      delete next[id]
      return next
    })
    await loadCourses()
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
    await loadCourses()
  }
  // Toggle a course's roster open/closed (multiple can be open at once)
  async function viewRoster(courseId) {
    if (openRosters[courseId]) {
      // already open → close it by removing its entry
      setOpenRosters(prev => {
        const next = { ...prev }
        delete next[courseId]
        return next
      })
      return
    }
    const res = await fetch(`${COURSES_API}/${courseId}/students`)
    const enrolled = await res.json()
    setOpenRosters(prev => ({ ...prev, [courseId]: enrolled }))
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
    await loadStudents()
  }
  async function deleteStudent(id) {
    await fetch(`${STUDENTS_API}/${id}`, { method: 'DELETE' })
    await loadStudents()
  }
  // Enroll a student in a course
  async function enroll(studentId, courseId) {
    if (!courseId) return
    await fetch(`${STUDENTS_API}/${studentId}/enroll/${courseId}`, { method: 'POST' })
    await refreshAfterEnrollmentChange()
  }
  // Unenroll a student from a course
  async function unenroll(studentId, courseId) {
    await fetch(`${STUDENTS_API}/${studentId}/enroll/${courseId}`, { method: 'DELETE' })
    await refreshAfterEnrollmentChange()
  }
  // After any enrollment change, reload students — and refresh every open roster
  async function refreshAfterEnrollmentChange() {
    await loadStudents()
    const openIds = Object.keys(openRosters)
    if (openIds.length > 0) {
      const updated = {}
      for (const id of openIds) {
        const res = await fetch(`${COURSES_API}/${id}/students`)
        updated[id] = await res.json()
      }
      setOpenRosters(updated)
    }
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
              <>
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
                          <button onClick={() => viewRoster(course.id)} style={rowBtn}>
                            {openRosters[course.id] ? 'Hide' : 'Roster'}
                          </button>
                          <button onClick={() => startEdit(course)} style={rowBtn}>Edit</button>
                          <button onClick={() => deleteCourse(course.id)} style={greyBtn}>Delete</button>
                        </td>
                      </>
                  )}
                </tr>
                {openRosters[course.id] && (
                    <tr key={`${course.id}-roster`}>
                      <td colSpan={4} style={rosterCell}>
                        <strong>Roster — {course.code}</strong>
                        {openRosters[course.id].length > 0 ? (
                            <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                              {openRosters[course.id].map(student => (
                                  <li key={student.id}>{student.name} ({student.email})</li>
                              ))}
                            </ul>
                        ) : (
                            <p style={{ margin: '6px 0 0', color: '#999' }}>No students enrolled yet.</p>
                        )}
                      </td>
                    </tr>
                )}
              </>
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
                      ? student.courses.map(c => (
                          <span key={c.id} style={chip}>
                        {c.code}
                            <button
                                onClick={() => unenroll(student.id, c.id)}
                                style={chipX}
                                title={`Unenroll from ${c.code}`}
                            >×</button>
                      </span>
                      ))
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
const chip = { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fce4ef', color: '#E8197A', padding: '2px 8px', borderRadius: 12, marginRight: 6, fontSize: '0.85em' }
const chipX = { background: 'none', border: 'none', color: '#E8197A', cursor: 'pointer', fontSize: '1.1em', lineHeight: 1, padding: 0 }
const rosterCell = { padding: '12px 16px', background: '#faf5f8', borderBottom: '1px solid #ddd' }

export default App