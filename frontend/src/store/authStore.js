import { create } from 'zustand';
import apiClient from '@/lib/api';
import { persist, createJSONStorage } from 'zustand/middleware'

// This creates a persistent store that saves data to localStorage
export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitializing: true,

            // Action to handle login
            login: async (username, password) => {
                const formBody = new URLSearchParams();
                formBody.append('username', username);
                formBody.append('password', password);

                const response = await apiClient.post('/auth/login/token', formBody, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                const { access_token } = response.data;
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                set({ token: access_token, isAuthenticated: true });

                // Fetch user data after setting the token
                await get().fetchUser();
            },

            // Action to fetch user data if a token exists
            fetchUser: async () => {
                try {
                    const response = await apiClient.get('/users/me');
                    set({ user: response.data });
                } catch (error) {
                    // Token is invalid or expired, so log out
                    get().logout();
                    throw error;
                }
            },

            // Action to handle logout
            logout: () => {
                delete apiClient.defaults.headers.common['Authorization'];
                set({ token: null, user: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                try {
                    // The interceptor will add the token from storage.
                    // This call will either succeed or fail (and trigger logout in catch).
                    await get().fetchUser();
                } catch (error) {
                    // fetchUser already handles logout on failure
                } finally {
                    set({ isInitializing: false });
                }
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // use localStorage
            // Only persist the 'token' field
            partialize: (state) => ({
                token: state.token, user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);