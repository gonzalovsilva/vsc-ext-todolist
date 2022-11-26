import { APP_ARGS } from '@/utils'
import { useNavigate } from 'react-router'

export const usePage = () => {
  const navigate = useNavigate()

  const gotoPlan = () => {
    navigate(
      APP_ARGS?.file
        ? `/todo_v2?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`
        : `/todo_v2`
    )
  }

  const gotoSchedule = () => {
    navigate(
      APP_ARGS.file
        ? `/calendar?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`
        : '/calendar'
    )
  }

  const goto = (page: 'plan' | 'schedule') => {
    if (page === 'plan') {
      gotoPlan()
      return
    }
    if (page === 'schedule') {
      gotoSchedule()
      return
    }
    gotoPlan()
  }

  return { gotoPlan, gotoSchedule, goto }
}
