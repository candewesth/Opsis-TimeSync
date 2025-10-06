// SUPABASE CONFIGURATION
// Obtén estos valores de: supabase.com → tu proyecto → Settings → API

const SUPABASE_URL = 'https://jnhrcvnfanyggmvbpijk.supabase.co'; // CAMBIA ESTO
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaHJjdm5mYW55Z2dtdmJwaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjIyMTEsImV4cCI6MjA3NTMzODIxMX0.eRrxp-anXV7kVamdJeco0QB_DOu-F20xtct66xboRS0'; // CAMBIA ESTO

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API Functions
const API = {
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

  async getStaff(role = null) {
    let query = supabase.from('staff').select('*');
    if (role) query = query.eq('role', role);
    
    const { data, error } = await query;
    if (error) console.error('getStaff error:', error);
    return { success: !error, staff: data || [] };
  },

  async addStaff(type, staffData) {
    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select();
    
    if (error) console.error('addStaff error:', error);
    return { success: !error, staff: data?.[0] };
  },

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

  async getDashboardStats() {
    const { data: allJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('active', true);
    
    const { data: allStaff } = await supabase
      .from('staff')
      .select('*');
    
    const activeJobs = allJobs?.filter(j => j.progress !== '100%').length || 0;
    const pendingJobs = allJobs?.filter(j => !j.supervisor).length || 0;
    const availableStaff = allStaff?.filter(s => s.status === 'AVAILABLE').length || 0;
    const totalStaff = allStaff?.length || 0;
    const completed = allJobs?.filter(j => j.progress === '100%').length || 0;
    const efficiency = allJobs?.length ? Math.round((completed / allJobs.length) * 100) : 0;
    
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
  }
};
