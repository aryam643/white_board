const cursorColors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

const UserCursors = ({ cursors }) => {
  const getCursorColor = (userId) => {
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return cursorColors[Math.abs(hash) % cursorColors.length]
  }

  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="user-cursor"
          style={{
            left: cursor.x - 6,
            top: cursor.y - 6,
            backgroundColor: getCursorColor(cursor.userId),
          }}
        />
      ))}
    </>
  )
}

export default UserCursors
