// ============================================
// API MODULE - SUPABASE OPERATIONS
// ============================================

console.log('📡 API Module loading...');

// Initialize Supabase client
let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
}

// API Object
const API = {
    // Test connection
    async testConnection() {
        try {
            console.log('🔌 Testing Supabase connection...');
            const { data, error } = await supabase.from('users').select('count').limit(1);
            
            if (error) {
                console.error('❌ Connection test failed:', error);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Connection successful!');
            return { success: true };
        } catch (err) {
            console.error('❌ Connection error:', err);
            return { success: false, error: err.message };
        }
    },

    // Get dashboard stats
    async getDashboardStats() {
        try {
            console.log('📊 Fetching dashboard stats...');
            
            // Get jobs count
            const { data: jobs, error: jobsError } = await supabase
                .from('jobs_2025_september')
                .select('*', { count: 'exact' });
            
            if (jobsError) {
                console.error('❌ Jobs query error:', jobsError);
                return { 
                    success: false, 
                    error: jobsError.message,
                    stats: { activeJobs: 0, totalStaff: 0, availableStaff: 0, pendingJobs: 0, efficiency: 0 }
                };
            }

            // Get staff count
            const { data: staff, error: staffError } = await supabase
                .from('staff')
                .select('*');
            
            if (staffError) {
                console.error('❌ Staff query error:', staffError);
            }

            const activeJobs = jobs?.length || 0;
            const totalStaff = staff?.length || 0;
            const availableStaff = staff?.filter(s => s.status === 'AVAILABLE').length || 0;
            const pendingJobs = jobs?.filter(j => j.progress !== '100%').length || 0;
            const efficiency = activeJobs > 0 ? Math.round((activeJobs - pendingJobs) / activeJobs * 100) : 0;

            const stats = {
                activeJobs,
                totalStaff,
                availableStaff,
                pendingJobs,
                efficiency
            };

            console.log('✅ Dashboard stats:', stats);
            return { success: true, stats };

        } catch (error) {
            console.error('❌ getDashboardStats error:', error);
            return { 
                success: false, 
                error: error.message,
                stats: { activeJobs: 0, totalStaff: 0, availableStaff: 0, pendingJobs: 0, efficiency: 0 }
            };
        }
    },

    // Get jobs
    async getJobs(year, month) {
        try {
            const tableName = `jobs_${year}_${month}`;
            console.log(`📅 Fetching jobs from ${tableName}...`);
            
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order('date', { ascending: false });
            
            if (error) {
                console.error('❌ getJobs error:', error);
                return { success: false, error: error.message, jobs: [] };
            }
            
            console.log(`✅ Found ${data?.length || 0} jobs`);
            return { success: true, jobs: data || [], total: data?.length || 0 };
        } catch (error) {
            console.error('❌ getJobs error:', error);
            return { success: false, error: error.message, jobs: [] };
        }
    },

    // Get staff
    async getStaff(role = null) {
        try {
            console.log(`👥 Fetching staff (role: ${role || 'all'})...`);
            
            let query = supabase.from('staff').select('*');
            
            if (role) {
                query = query.eq('role', role);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('❌ getStaff error:', error);
                return { success: false, error: error.message, staff: [] };
            }
            
            console.log(`✅ Found ${data?.length || 0} staff members`);
            return { success: true, staff: data || [] };
        } catch (error) {
            console.error('❌ getStaff error:', error);
            return { success: false, error: error.message, staff: [] };
        }
    },

    // Get users
    async getUsers() {
        try {
            console.log('👤 Fetching users...');
            
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('username');
            
            if (error) {
                console.error('❌ getUsers error:', error);
                return { success: false, error: error.message, users: [] };
            }
            
            console.log(`✅ Found ${data?.length || 0} users`);
            return { success: true, users: data || [] };
        } catch (error) {
            console.error('❌ getUsers error:', error);
            return { success: false, error: error.message, users: [] };
        }
    },

    // Add user
    async addUser(userData) {
        try {
            console.log('➕ Adding user:', userData.username);
            
            const { data, error } = await supabase
                .from('users')
                .insert([userData])
                .select();
            
            if (error) {
                console.error('❌ addUser error:', error);
                return { success: false, error: error.message };
            }
            
            console.log('✅ User added successfully');
            return { success: true, user: data[0] };
        } catch (error) {
            console.error('❌ addUser error:', error);
            return { success: false, error: error.message };
        }
    }
};

console.log('✅ API Module loaded successfully');

// Make API available globally
window.API = API;
