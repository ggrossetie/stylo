import { Tabs } from '@geist-ui/core'
import React from 'react'
import { Search } from 'react-feather'
import buttonStyles from '../components/button.module.scss'
import Field from '../components/Field.jsx'
import Select from '../components/Select.jsx'
import ButtonStory from './Button.story.jsx'
import FormStory from './Form.story.jsx'

import styles from './story.module.scss'

export default function Story () {
  return <div className={styles.container}>
    <Tabs initialValue="1">
      <Tabs.Item label="buttons" value="1">
        <ButtonStory/>
      </Tabs.Item>
      <Tabs.Item label="form" value="2">
        <FormStory/>
      </Tabs.Item>
      <Tabs.Item label="fields" value="3">
        <h2>Fields</h2>
        <h4>Search</h4>
        <Field placeholder="Search" icon={Search}/>
        <h4>Textarea</h4>
        <div style={{ 'max-width': '50%' }}>
          <textarea className={buttonStyles.textarea} rows="10">Du texte</textarea>
        </div>
        <h4>Select</h4>
        <Select>
          <option>Tome de Savoie</option>
          <option>Reblochon</option>
          <option>St Marcellin</option>
        </Select>
      </Tabs.Item>
      <Tabs.Item label="flex" value="4">
        <div className={styles.nav}>
          <div className={styles.block}>
            <div className={styles.item}>
              <span className={styles.text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mattis ornare euismod. Maecenas vulputate quam quis sapien aliquam, egestas interdum justo vulputate. Aliquam tempus elit augue, et maximus ligula fermentum sed. Mauris aliquam magna purus, vitae feugiat ante vestibulum in. Phasellus a libero scelerisque, vestibulum ligula sit amet, luctus nulla. In elementum mi nec augue commodo, eget pretium turpis facilisis. Fusce et nibh id augue pharetra imperdiet. Cras consequat turpis eros, id auctor nisl semper id. Mauris vestibulum neque at est vulputate vulputate. Praesent leo quam, venenatis in ante ac, commodo iaculis dolor. Nam ut leo est. Maecenas id eros in odio congue placerat a eu odio. Integer et vehicula ligula. Cras viverra elit nec ullamcorper consectetur. Sed tempus condimentum sapien ut varius. Maecenas non nulla vel dolor varius ultricies.</span>
              <button className={styles.btn}>OK</button>
            </div>
          </div>
        </div>
      </Tabs.Item>
    </Tabs>
  </div>
}
