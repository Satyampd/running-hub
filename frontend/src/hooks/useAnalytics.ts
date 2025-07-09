import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const TRACKING_ID = 'G-51180YJK82' 

ReactGA.initialize(TRACKING_ID)

const useAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
    })
  }, [location])
}

export default useAnalytics
