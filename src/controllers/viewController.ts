import { Request, Response } from 'express'

export const getOverview = (_req: Request, res: Response) => {
  res.status(200).render('overview', { title: 'All Tours' })
}

export const getTour = (_req: Request, res: Response) => {
  res.status(200).render('tour', { title: 'The Forest Hiker Tour' })
}
