// ============================================================
// Data access layer — Firebase Web SDK for decisions & assumptions
// Directly queries Cloud Firestore on the client side
// ============================================================

import { db, auth } from '@/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore'
import { calculateDQS } from '@/lib/scoring'
import type { Decision, WizardFormData, ReviewFormData, Assumption, DecisionStatus } from '@/lib/types'

// Helper: Convert Firestore Document to Decision object
function docToDecision(id: string, data: DocumentData): Decision {
  const today = new Date().toISOString().substring(0, 10)
  const expectedOutcomeDate = data.expectedOutcomeDate || null
  const isOverdue =
    data.status === 'active' &&
    !!expectedOutcomeDate &&
    expectedOutcomeDate < today

  return {
    id,
    title:                  data.title || '',
    description:            data.description || null,
    category:               data.category || 'Personal',
    decisionDate:           data.decisionDate || null,
    chosenOption:           data.chosenOption || null,
    alternatives:           data.alternatives || [],
    reasoning:              data.reasoning || null,
    predictedOutcome:       data.predictedOutcome || null,
    confidence:             data.confidence ?? 70,
    expectedOutcomeDate,
    emotion:                data.emotion || null,
    actualOutcome:          data.actualOutcome || null,
    outcomeDate:            data.outcomeDate || null,
    predictedOutcomeCorrect: data.predictedOutcomeCorrect || null,
    whatSurprised:          data.whatSurprised || null,
    whatDifferently:        data.whatDifferently || null,
    wasDecisionGood:        data.wasDecisionGood || null,
    reflection:             data.reflection || null,
    lessons:                data.lessons || null,
    dqs:                    data.dqs ?? null,
    assumptionAccuracy:     data.assumptionAccuracy ?? null,
    outcomeAccuracy:        data.outcomeAccuracy ?? null,
    status:                 (data.status || 'active') as DecisionStatus,
    createdAt:              data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    updatedAt:              data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
    assumptions:            (data.assumptions || []).map((a: any, idx: number) => ({
      id:         a.id || String(idx),
      decisionId: id,
      text:       a.text || '',
      status:     a.status || 'pending',
      sortOrder:  a.sortOrder ?? idx,
    })),
    isOverdue,
  }
}

// ============================================================
// READ — fetch all decisions for the current authenticated user
// ============================================================
export async function getDecisions(): Promise<Decision[]> {
  const currentUser = auth.currentUser
  if (!currentUser) return []

  try {
    const q = query(
      collection(db, 'decisions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const snap = await getDocs(q)
    return snap.docs.map(doc => docToDecision(doc.id, doc.data()))
  } catch (error) {
    console.error('getDecisions error:', error)
    return []
  }
}

// ============================================================
// READ — fetch a single decision by ID
// ============================================================
export async function getDecision(id: string): Promise<Decision | null> {
  const currentUser = auth.currentUser
  if (!currentUser) return null

  try {
    const docRef = doc(db, 'decisions', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    // Security check (equivalent to RLS)
    if (data.userId !== currentUser.uid) {
      console.warn('Unauthorized access attempt to decision:', id)
      return null
    }

    return docToDecision(docSnap.id, data)
  } catch (error) {
    console.error('getDecision error:', error)
    return null
  }
}

// ============================================================
// CREATE — save a new decision from the wizard
// ============================================================
export async function createDecision(data: WizardFormData): Promise<{ id: string } | { error: string }> {
  const currentUser = auth.currentUser
  if (!currentUser) return { error: 'Not authenticated' }

  try {
    const assumptions = data.assumptions
      .filter(t => t.trim())
      .map((text, i) => ({
        id:         `asm-${Date.now()}-${i}`,
        text:       text.trim(),
        status:     'pending' as const,
        sortOrder:  i,
      }))

    const docRef = await addDoc(collection(db, 'decisions'), {
      userId:               currentUser.uid,
      title:                data.title.trim(),
      description:          data.description.trim() || null,
      category:             data.category,
      decisionDate:         data.decisionDate || null,
      chosenOption:         data.chosenOption.trim() || null,
      alternatives:         data.alternatives.filter(Boolean),
      reasoning:            data.reasoning.trim() || null,
      predictedOutcome:     data.predictedOutcome.trim() || null,
      confidence:           data.confidence,
      expectedOutcomeDate:  data.expectedOutcomeDate || null,
      emotion:              data.emotion,
      status:               'active',
      assumptions,
      createdAt:            serverTimestamp(),
      updatedAt:            serverTimestamp(),
    })

    return { id: docRef.id }
  } catch (error: any) {
    console.error('createDecision error:', error)
    return { error: error.message || 'Failed to create decision' }
  }
}

// ============================================================
// UPDATE — save outcome review
// ============================================================
export async function saveReview(
  decisionId: string,
  data: ReviewFormData,
  assumptions: Array<{ id: string; text: string }>
): Promise<{ success: true } | { error: string }> {
  const currentUser = auth.currentUser
  if (!currentUser) return { error: 'Not authenticated' }

  try {
    const docRef = doc(db, 'decisions', decisionId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return { error: 'Decision not found' }
    if (docSnap.data().userId !== currentUser.uid) return { error: 'Unauthorized' }

    // Map updated assumption statuses
    const updatedAssumptions: Assumption[] = assumptions.map(a => ({
      id:         a.id,
      decisionId: decisionId,
      text:       a.text,
      status:     data.assumptionStatuses[a.id] ?? 'unknown',
      sortOrder:  0,
    }))

    const { dqs, assumptionAccuracy, outcomeAccuracy } = calculateDQS(
      updatedAssumptions,
      data.predictedOutcomeCorrect
    )

    await updateDoc(docRef, {
      actualOutcome:            data.actualOutcome.trim() || null,
      outcomeDate:              data.outcomeDate || null,
      predictedOutcomeCorrect:  data.predictedOutcomeCorrect,
      whatSurprised:            data.whatSurprised.trim() || null,
      whatDifferently:          data.whatDifferently.trim() || null,
      wasDecisionGood:          data.wasDecisionGood,
      reflection:                data.reflection.trim() || null,
      lessons:                   data.lessons.trim() || null,
      dqs,
      assumptionAccuracy,
      outcomeAccuracy,
      status:                    'resolved',
      assumptions:               updatedAssumptions.map(a => ({
        id: a.id,
        text: a.text,
        status: a.status,
        sortOrder: a.sortOrder,
      })),
      updatedAt:                 serverTimestamp(),
    })

    return { success: true }
  } catch (error: any) {
    console.error('saveReview error:', error)
    return { error: error.message || 'Failed to save review' }
  }
}

// ============================================================
// DELETE — remove a decision
// ============================================================
export async function deleteDecision(id: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = auth.currentUser
  if (!currentUser) return { success: false, error: 'Not authenticated' }

  try {
    const docRef = doc(db, 'decisions', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return { success: false, error: 'Not found' }
    if (docSnap.data().userId !== currentUser.uid) return { success: false, error: 'Unauthorized' }

    await deleteDoc(docRef)
    return { success: true }
  } catch (error: any) {
    console.error('deleteDecision error:', error)
    return { success: false, error: error.message }
  }
}
