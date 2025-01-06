'client'
export default function DeskMenuCloseButton({ children, className, style }) {
  return (
    <button onClick={(event)=>{
      console.log(event.currentTarget);
    }} className={className} style={style}>
      {children}
    </button>
  )
}
