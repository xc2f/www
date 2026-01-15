'use client'
import React from 'react'
import { Gutter, Button, toast } from '@payloadcms/ui'

const Backup = () => {
  const handleBackup = async () => {
    const loading = toast.loading('备份中...')
    const res = await fetch('/api/backup/database')
    toast.dismiss(loading)
    if (res.ok) {
      toast.success('备份成功！')
    }
  }

  return (
    <Gutter>
      <h1>System</h1>
      <Button onClick={handleBackup}>Backup Database</Button>
    </Gutter>
  )
}

Backup.propTypes = {}

export default Backup
