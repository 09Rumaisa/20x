import { describe, it, expect } from 'vitest'
import { createTestDb } from './helpers/db-test-helper'
import { makeTask } from './helpers/task-fixtures'

describe('database resilience', () => {
  it('returns task with empty arrays when JSON columns are malformed', () => {
    const { db, rawDb } = createTestDb()

    // First create a normal task
    const task = db.createTask(makeTask({ title: 'Corrupt Task' }))

    // Then directly corrupt its labels column with invalid JSON
    rawDb.prepare(
      `UPDATE tasks SET labels = ? WHERE id = ?`
    ).run('not valid json{', task!.id)

    // getTask should NOT throw — should return task with labels as []
    const result = db.getTask(task!.id)

    expect(result).not.toBeNull()
    expect(result?.labels).toEqual([])
    expect(result?.title).toBe('Corrupt Task')
  })
})
