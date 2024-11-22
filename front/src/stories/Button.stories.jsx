import React from 'react'
import { fn } from '@storybook/test'
import { Copy, Save } from 'react-feather'
import Button from '../components/Button.jsx'

export default {
  title: 'Stylo/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { 
    onClick: fn(),
    secondary: false,
    icon: false,
    small: false,
    link: false
  },
};

export const Primary = {
  args: {
    primary: true,
    children: 'Create New Article'
  },
};

export const Secondary = {
  args: {
    children: 'Manage Tags'
  },
};

export const Tertiary = {
  args: {
    tertiary: true,
    children: 'Preview'
  },
};

export const WithIcon = {
  render: (args) =>  {
    return <Button {...args}>
      <Save/> Save
    </Button>
  }
};

export const WithIconOnly = {
  render: (args) =>  {
    return <Button {...args}>
      <Copy/>
    </Button>
  },
  args: {
    icon: true
  }
};
