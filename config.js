// SUPABASE CONFIGURATION
// Obtén estos valores de: supabase.com → tu proyecto → Settings → API

const SUPABASE_URL = 'https://jnhrcvnfanyggmvbpijk.supabase.co'; // CAMBIA ESTO
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaHJjdm5mYW55Z2dtdmJwaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjIyMTEsImV4cCI6MjA3NTMzODIxMX0.eRrxp-anXV7kVamdJeco0QB_DOu-F20xtct66xboRS0'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API Functions para Opsis TimeSync
const API = {
  // ==================== JOBS ====================
  async getJobs(year, month) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .eq('active', true)
      .order('date', { ascending: true });
    
    if (error) console.error('getJobs error:', error);
    return { success: !error, jobs: data || [], total: data?.length || 0 };
  },

  async createJob(job, year, month) {
    job.year = year;
    job.month = month;
    job.row_id = `${year}_${month}_${Date.now()}`;
    job.active = true;
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select();
    
    if (error) console.error('createJob error:', error);
    return { success: !error, job: data?.[0] };
  },

  async updateJob(rowId, updates, year, month) {
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('row_id', rowId)
      .select();
    
    if (error) console.error('updateJob error:', error);
    return { success: !error, job: data?.[0] };
  },

  async deleteJob(rowId) {
    const { error } = await supabase
      .from('jobs')
      .update({ active: false })
      .eq('row_id', rowId);
    
    if (error) console.error('deleteJob error:', error);
    return { success: !error };
  },

  // ==================== STAFF ====================
  async getStaff(role = null) {
    let query = supabase.from('staff').select('*');
    if (role) query = query.eq('role', role);
    
    const { data, error } = await query;
    if (error) console.error('getStaff error:', error);
    return { success: !error, staff: data || [] };
  },

  async addStaff(type, staffData) {
    // Asegurar que specialties sea un array JSON
    if (Array.isArray(staffData.specialties)) {
      staffData.specialties = JSON.stringify(staffData.specialties);
    }
    
    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select();
    
    if (error) console.error('addStaff error:', error);
    return { success: !error, staff: data?.[0] };
  },

  async updateStaff(employeeNumber, updates) {
    if (Array.isArray(updates.specialties)) {
      updates.specialties = JSON.stringify(updates.specialties);
    }
    
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('employee_number', employeeNumber)
      .select();
    
    if (error) console.error('updateStaff error:', error);
    return { success: !error, staff: data?.[0] };
  },

  async deleteStaff(employeeNumber) {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('employee_number', employeeNumber);
    
    if (error) console.error('deleteStaff error:', error);
    return { success: !error };
  },

  // ==================== CERTIFICATIONS ====================
  async getCertifications() {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('expiry_date', { ascending: true });
    
    if (error) console.error('getCertifications error:', error);
    return { success: !error, certifications: data || [] };
  },

  async addCertification(cert) {
    const { data, error } = await supabase
      .from('certifications')
      .insert([cert])
      .select();
    
    if (error) console.error('addCertification error:', error);
    return { success: !error, certification: data?.[0] };
  },

  async updateCertification(id, updates) {
    const { data, error } = await supabase
      .from('certifications')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) console.error('updateCertification error:', error);
    return { success: !error, certification: data?.[0] };
  },

  async deleteCertification(id) {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);
    
    if (error) console.error('deleteCertification error:', error);
    return { success: !error };
  },

  // ==================== USERS ====================
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, active, created_at');
    
    if (error) console.error('getUsers error:', error);
    return { success: !error, users: data || [] };
  },

  async addUser(userData) {
    // ⚠️ IMPORTANTE: En producción debes hashear la contraseña
    // Por ahora guardamos en texto plano solo para pruebas
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: userData.username,
        password_hash: userData.password, // ⚠️ Cambiar en producción
        role: userData.role || 'USER',
        active: userData.active !== false
      }])
      .select();
    
    if (error) console.error('addUser error:', error);
    return { success: !error, user: data?.[0] };
  },

  async updateUser(username, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('username', username)
      .select();
    
    if (error) console.error('updateUser error:', error);
    return { success: !error, user: data?.[0] };
  },

  async deleteUser(username) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('username', username);
    
    if (error) console.error('deleteUser error:', error);
    return { success: !error };
  },

  // ==================== DASHBOARD ====================
  async getDashboardStats() {
    // Obtener todos los jobs activos
    const { data: allJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('active', true);
    
    // Obtener todo el personal
    const { data: allStaff } = await supabase
      .from('staff')
      .select('*');
    
    const activeJobs = allJobs?.filter(j => j.progress !== '100%').length || 0;
    const pendingJobs = allJobs?.filter(j => !j.supervisor || j.status === 'NEW').length || 0;
    const availableStaff = allStaff?.filter(s => s.status === 'AVAILABLE').length || 0;
    const totalStaff = allStaff?.length || 0;
    const completed = allJobs?.filter(j => j.progress === '100%').length || 0;
    const total = allJobs?.length || 0;
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      success: true,
      stats: {
        activeJobs,
        pendingJobs,
        availableStaff,
        totalStaff,
        efficiency
      }
    };
  },

  // ==================== COLUMN SCHEMA ====================
  async getColumnSchema() {
    // Por ahora retornamos vacío, se maneja localmente
    return { success: true, schema: [] };
  },

  async syncColumns(columns) {
    // Por ahora solo confirmamos, se guarda en localStorage
    return { success: true };
  },

  async addColumn(column) {
    // Por ahora solo confirmamos
    return { success: true };
  }
};

// Verificar conexión al cargar
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data, error } = await supabase.from('jobs').select('id').limit(1);
    if (!error) {
      console.log('✅ Supabase connected successfully');
    } else {
      console.error('❌ Supabase connection error:', error);
    }
  } catch (e) {
    console.error('❌ Supabase initialization error:', e);
  }
});
