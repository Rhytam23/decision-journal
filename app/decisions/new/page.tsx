import type { Metadata } from 'next'
import { DecisionWizard } from '@/components/decisions/DecisionWizard'

export const metadata: Metadata = {
  title: 'Record a Decision',
}

export default function NewDecisionPage() {
  return <DecisionWizard />
}
