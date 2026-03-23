import clsx from 'clsx'

import { Badge } from '../../atoms/index.js'

import styles from './EditorMenuItem.module.scss'

export default function EditorMenuItem({
  icon,
  text,
  minimized,
  selected,
  external = false,
  counter = 0,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(styles.container, selected && styles.selected)}
      title={text}
    >
      {icon}
      {counter > 0 && (
        <Badge label={counter} color={'#E91E63'} className={styles.badge} />
      )}
      <span
        className={clsx(
          styles.text,
          minimized && styles.hide,
          external && styles.external
        )}
      >
        {text}
      </span>
    </button>
  )
}
