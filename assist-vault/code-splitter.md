1. STYLE SEPARATION
Input: React/Solid component with inline styles
Output: 
- Clean component with CSS modules
- Separate .module.css file
- Dynamic styles retained inline

CSS Formatting Rules:
- One line per class/selector
- No line breaks within declarations
- Space after colon in properties
- No space before colon
- Semi-colon after each declaration 
- Single quotes for string values
- Space after comma in values
- No trailing semi-colon on last property

Example Format:
.className { color: #000; font-size: 16px; background: linear-gradient(to right, #fff, #000); }

Rules:
- Extract all static styles to .module.css
- Keep dynamic styles inline
- Maintain identical visual output
- Use minimum class names
- Leverage CSS selectors
- Icons can have classNames
Example Input:


const Card = ({ selected, title }) => (
  <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
    <h2 style={{ fontSize: '24px', color: selected ? 'blue' : 'black' }}>{title}</h2>
    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
      <span style={{ color: '#666' }}>Content</span>
    </div>
  </div>
)

Example Output:
card.jsx:

import styles from './card.module.css'

const Card = ({ selected, title }) => (
  <div className={styles.card}>
    <h2 className={styles.title} style={{ color: selected ? 'blue' : 'black' }}>{title}</h2>
    <div className={styles.content}>
      <span className={styles.text}>Content</span>
    </div>
  </div>
)

card.module.css:

.card { padding: 20px; background: #fff; border-radius: 8px; }
.title { font-size: 24px; }
.content { display: flex; gap: 10px; margin-top: 16px; }
.text { color: #666; }

2. LOGIC SEPARATION
Input: Component with mixed rendering and logic
Output:

.Clean component file (.jsx)
.Separate logic file (.func.js)
.Custom hook for logic export

Example Input:

const Card = () => {
  const [selected, setSelected] = useState(false)
  const [title, setTitle] = useState('')
  
  const handleSelect = () => {
    setSelected(!selected)
  }
  
  const updateTitle = (newTitle) => {
    setTitle(newTitle)
  }

  return (
    <div onClick={handleSelect}>
      <h2>{title}</h2>
    </div>
  )
}

Example Output:
card.jsx:

import { useCardLogic } from './card.func'

const Card = () => {
  const { selected, title, handleSelect, updateTitle } = useCardLogic()

  return (
    <div onClick={handleSelect}>
      <h2>{title}</h2>
    </div>
  )
}

card.func.js:

export function useCardLogic() {
  const [selected, setSelected] = useState(false)
  const [title, setTitle] = useState('')
  
  const handleSelect = () => {
    setSelected(!selected)
  }
  
  const updateTitle = (newTitle) => {
    setTitle(newTitle)
  }

  return {
    selected,
    title, 
    handleSelect,
    updateTitle
  }
}

Validation:

.Visual output matches original
.No static styles remain inline
.Dynamic styles preserved inline
.CSS formatted single-line with proper spacing
.Logic fully separated into custom hook
.Component only contains JSX and logic hook usage

These instructions now include:
- Specific CSS formatting rules
- Complete working examples
- Clear input/output patterns
- Validation criteria