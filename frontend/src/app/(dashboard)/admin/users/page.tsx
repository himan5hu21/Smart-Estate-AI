'use client'

import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '@/lib/api'
import { Table, TableRow, TableCell } from '@/components/Table'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import Link from 'next/link'

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      await deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
      alert('User deleted successfully.')
    } catch (error) {
      alert('Failed to delete user.')
    }
  }

  if (loading) return <div className="p-8">Loading users...</div>

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users.</p>
      </div>

      <Table headers={['Name', 'Email', 'Role', 'Actions']}>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
               <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:underline">
                {user.full_name}
               </Link>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Link href={`/admin/users/${user.id}`}>
                   <Button size="sm" variant="outline">View</Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  )
}
