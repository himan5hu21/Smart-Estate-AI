'use client'

import { useEffect, useState } from 'react'
import { getAgents, verifyAgent } from '@/lib/api'
import { Table, TableRow, TableCell } from '@/components/Table'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import Link from 'next/link'

export default function AgentApprovals() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgents = async () => {
    try {
      const data = await getAgents()
      // Filter for unverified agents
      setAgents(data.filter((a: any) => !a.is_verified))
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleVerify = async (id: string) => {
    try {
      await verifyAgent(id)
      setAgents(agents.filter(a => a.id !== id))
      alert('Agent verified successfully!')
    } catch (error: any) {
      console.error('Verification failed:', error)
      alert(`Verification failed: ${error.message || 'Please try again.'}`)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Verification</h1>
        <p className="text-muted-foreground">Verify agent credentials to give them listing privileges.</p>
      </div>

      <Table headers={['Name', 'Email', 'Verification Status', 'Actions']}>
        {agents.length === 0 ? (
          <TableRow>
            <TableCell className="text-center py-8 text-muted-foreground" colSpan={4}>
              No unverified agents.
            </TableCell>
          </TableRow>
        ) : (
          agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium">
                <a href={`/admin/approvals/agents/${agent.id}`} className="text-blue-600 hover:underline">
                  {agent.full_name}
                </a>
              </TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>
                <Badge variant="subtle" className="bg-red-100 text-red-700">Unverified</Badge>
              </TableCell>
              <TableCell>
                 <div className="flex gap-2">
                   <Link href={`/admin/approvals/agents/${agent.id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                   </Link>
                  <Button size="sm" onClick={() => handleVerify(agent.id)}>Quick Verify</Button>
                 </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  )
}
