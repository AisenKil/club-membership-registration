import { useCallback, useEffect, useReducer, useRef } from 'react';
import api from '../api/axios.js';
import type { Member, MemberPayload } from '../types';

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
}

type MembersAction =
  | { type: 'loading' }
  | { type: 'loaded'; payload: Member[] }
  | { type: 'failed'; payload: string }
  | { type: 'removed'; payload: number };

const initialState: MembersState = { members: [], loading: true, error: null };

function membersReducer(state: MembersState, action: MembersAction): MembersState {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: true, error: null };
    case 'loaded':
      return { ...state, loading: false, error: null, members: action.payload };
    case 'failed':
      return { ...state, loading: false, error: action.payload };
    case 'removed':
      return { ...state, members: state.members.filter((member) => member.id !== action.payload) };
    default:
      return state;
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const response = (error as { response?: unknown }).response;
    if (!response) return 'The API could not be reached. Check that Express is running on port 3000.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'The server could not be reached. Check that the API and database are running.';
}

export function useMembers(search: string, club: string) {
  const [state, dispatch] = useReducer(membersReducer, initialState);
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;
    dispatch({ type: 'loading' });
    try {
      const response = await api.get<Member[]>('/members', { params: { search, club } });
      if (requestId === latestRequest.current) dispatch({ type: 'loaded', payload: response.data });
    } catch (error) {
      if (requestId === latestRequest.current) dispatch({ type: 'failed', payload: getErrorMessage(error) });
    }
  }, [search, club]);

  useEffect(() => {
    // A short debounce avoids sending a request for every keystroke.
    const timer = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createMember = useCallback(async (payload: MemberPayload) => {
    await api.post<Member>('/members', payload);
    await refresh();
  }, [refresh]);

  const updateMember = useCallback(async (id: number, payload: MemberPayload) => {
    await api.put<Member>(`/members/${id}`, payload);
    await refresh();
  }, [refresh]);

  const deleteMember = useCallback(async (id: number) => {
    await api.delete(`/members/${id}`);
    dispatch({ type: 'removed', payload: id });
    await refresh();
  }, [refresh]);

  return {
    members: state.members,
    loading: state.loading,
    error: state.error,
    refresh,
    createMember,
    updateMember,
    deleteMember,
  };
}
