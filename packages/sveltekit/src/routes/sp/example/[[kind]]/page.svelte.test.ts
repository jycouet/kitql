// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest'

import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'

import { page } from '$app/state'

// Import the component and mocked modules
import PageComponent from './+page.svelte'

// IMPORTANT: vi.mock calls are hoisted to the top of the file
// We must not reference any variables defined elsewhere in the file

// Define a custom URL type for testing
interface MockURL {
  searchParams: URLSearchParams
  pathname: string
  searchParamsObj?: URLSearchParams
}

// Mock modules with inline factory functions
vi.mock('$app/navigation', () => {
  return {
    goto: vi.fn(),
  }
})

// Mock the page store at the module level
vi.mock('$app/state', () => {
  // Create mock objects for the page store inside the factory function
  const mockSearchParams = new URLSearchParams()
  const mockUrl: MockURL = {
    searchParams: mockSearchParams,
    pathname: '/',
  }

  // Define a property to allow updating searchParams
  Object.defineProperty(mockUrl, 'searchParamsObj', {
    set(value: URLSearchParams) {
      // @ts-ignore - we need to override the readonly property for testing
      mockUrl.searchParams = value
    },
  })

  const mockPage = {
    url: mockUrl,
    params: {},
    route: { id: '' },
    status: 200,
    error: null,
    data: {},
    form: null,
    subscribe: vi.fn((fn) => {
      fn(mockPage)
      return { unsubscribe: () => {} }
    }),
  }

  return {
    page: mockPage,
  }
})

describe('SP Example Page', () => {
  beforeEach(() => {
    cleanup()
    vi.resetAllMocks()

    // Reset mock values
    Object.assign(page.params, {})
    // Use the setter to update searchParams
    ;(page.url as MockURL).searchParamsObj = new URLSearchParams()
  })

  test('1. Arriving on the page without any search params shows default state', async () => {
    // Set up page mock with no search params
    Object.assign(page.params, { kind: 'undef' })
    // Use the setter to update searchParams
    ;(page.url as MockURL).searchParamsObj = new URLSearchParams()

    const { container } = render(PageComponent)

    // Test initial state of the form fields
    expect(screen.getByDisplayValue('kind')).toBeInTheDocument() // Name field
    expect(screen.getByDisplayValue('kind2')).toBeInTheDocument() // Name2 field
    expect(screen.getByDisplayValue('25')).toBeInTheDocument() // Age field
    expect(screen.getByRole('checkbox')).toBeChecked() // Active checkbox

    // Test the select field's initial value
    const selectElement = container.querySelector('select')
    expect(selectElement).toHaveValue('2') // Default value is bike (id: 2)

    // Check that the object state is showing correct values
    const preContent = screen.getByText(/"name": "kind"/, { exact: false })
    expect(preContent).toBeInTheDocument()
    expect(preContent).toHaveTextContent(/"age": 25/)
    expect(preContent).toHaveTextContent(/"active": true/)
    expect(preContent).toHaveTextContent(/"sel": {[^}]*"id": 2/)
  })

  test('2. Arriving with search params populates the form fields correctly', async () => {
    // Set up page mock with search params
    const searchParams = new URLSearchParams()
    searchParams.set('name', 'testName')
    searchParams.set('name2', 'testName2')
    searchParams.set('age', '30')
    searchParams.set('active', 'false')
    searchParams.set('sel', '1') // car

    Object.assign(page.params, { kind: 'k1' })
    // Use the setter to update searchParams
    ;(page.url as MockURL).searchParamsObj = searchParams

    const { container } = render(PageComponent)

    // Test that form fields reflect the search params
    expect(screen.getByDisplayValue('testName')).toBeInTheDocument()
    expect(screen.getByDisplayValue('testName2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('30')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()

    // Test the select field's value
    const selectElement = container.querySelector('select')
    expect(selectElement).toHaveValue('1') // car (id: 1)

    // Check that the object state is showing correct values
    const preContent = screen.getByText(/"name": "testName"/, { exact: false })
    expect(preContent).toBeInTheDocument()
    expect(preContent).toHaveTextContent(/"age": 30/)
    expect(preContent).toHaveTextContent(/"active": false/)
    expect(preContent).toHaveTextContent(/"sel": {[^}]*"id": 1/)
  })

  test('3. Changing data updates the select and object state', async () => {
    // Start with default state
    Object.assign(page.params, { kind: 'undef' })
    // Use the setter to update searchParams
    ;(page.url as MockURL).searchParamsObj = new URLSearchParams()

    const { container } = render(PageComponent)

    // Change the name field
    const nameInput = screen.getByDisplayValue('kind')
    await fireEvent.input(nameInput, { target: { value: 'newName' } })

    // Change the age field
    const ageInput = screen.getByDisplayValue('25')
    await fireEvent.input(ageInput, { target: { value: '40' } })

    // Toggle the active checkbox
    const activeCheckbox = screen.getByRole('checkbox')
    await fireEvent.click(activeCheckbox)

    // Change the select field
    const selectElement = container.querySelector('select')
    await fireEvent.change(selectElement as HTMLSelectElement, { target: { value: '1' } })

    // Check that the object state has been updated
    const preContent = screen.getByText(/"name": "newName"/, { exact: false })
    expect(preContent).toBeInTheDocument()
    expect(preContent).toHaveTextContent(/"age": 40/)
    expect(preContent).toHaveTextContent(/"active": false/)
    expect(preContent).toHaveTextContent(/"sel": {[^}]*"id": 1[^}]*"name": "car"/)

    // Verify that the select shows the car name
    expect(screen.getByText('car')).toBeInTheDocument()

    // Test the reset button
    const resetButton = screen.getByText('Reset to Defaults')
    await fireEvent.click(resetButton)

    // After reset, values should be back to defaults
    expect(screen.getByDisplayValue('kind')).toBeInTheDocument()
    expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(container.querySelector('select')).toHaveValue('2') // bike
  })
})
