import api from './api';

const base = '/bugs';

/**
 * Get all bugs from the backend
 * @returns {Promise} Axios response with array of bugs
 */
export const getAllBugs = () => api.get(`${base}`);

/**
 * Get a single bug by ID
 * @param {number|string} id - Bug ID
 * @returns {Promise} Axios response with bug object
 */
export const getBugById = (id) => api.get(`${base}/${id}`);

/**
 * Create a new bug
 * @param {Object} bug - Bug object with title, description, status, priority, assignedTo
 * @returns {Promise} Axios response with created bug object
 */
export const createBug = (bug) => api.post(`${base}`, bug);

/**
 * Update an existing bug
 * @param {number|string} id - Bug ID
 * @param {Object} bug - Bug object with fields to update
 * @returns {Promise} Axios response with updated bug object
 */
export const updateBug = (id, bug) => api.put(`${base}/${id}`, bug);

/**
 * Delete a bug by ID
 * @param {number|string} id - Bug ID
 * @returns {Promise} Axios response
 */
export const deleteBug = (id) => api.delete(`${base}/${id}`);

/**
 * Get all employees
 * @returns {Promise} Axios response with array of employees
 */
export const getAllEmployees = () => api.get('/employees');


