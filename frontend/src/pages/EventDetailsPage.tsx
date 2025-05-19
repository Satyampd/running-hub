import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEventById } from '../services/api'

type Event = {
  id: string
  title: string
  date: string
  location: string
  categories: string[]
  price: string
  url: string
  source: string
  description?: string
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center text-red-600">
        Error loading event details. Please try again later.
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-2xl leading-6 font-bold text-gray-900">{event.title}</h3>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="mr-4">{event.date}</span>
          <span>{event.location}</span>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Categories</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {event.categories.join(', ')}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Price</dt>
            <dd className="mt-1 text-sm text-gray-900">{event.price}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="mt-1 text-sm text-gray-900">{event.source}</dd>
          </div>
          {event.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{event.description}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full sm:w-auto text-center"
        >
          {event.url}
        </a>
      </div>
    </div>
  )
} 