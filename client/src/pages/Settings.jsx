import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Input, Card } from '../components/ui/index.js';
import { 
  User, Mail, Lock, Camera, ArrowLeft, Save, AlertCircle,
  CheckCircle2, Loader2
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    const result = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-surface border-r border-border min-h-screen sticky top-0">
          <div className="p-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-text-secondary hover:text-accent mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <h1 className="font-display text-xl font-semibold text-text-primary mb-6">
              Settings
            </h1>

            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMessage(null);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${activeTab === 'profile' 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}
                `}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('password');
                  setMessage(null);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${activeTab === 'password' 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}
                `}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Password</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  mb-6 p-4 rounded-lg flex items-center gap-2
                  ${message.type === 'success' 
                    ? 'bg-success/10 border border-success/30 text-success' 
                    : 'bg-danger/10 border border-danger/30 text-danger'}
                `}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {message.text}
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center overflow-hidden">
                      {profileData.avatar ? (
                        <img 
                          src={profileData.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-accent" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors">
                      <Camera className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">{user?.name}</h2>
                    <p className="text-text-secondary">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    leftIcon={<User className="w-5 h-5" />}
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    leftIcon={<Mail className="w-5 h-5" />}
                    disabled
                  />
                  
                  <Input
                    label="Profile Image URL"
                    value={profileData.avatar}
                    onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    leftIcon={<Camera className="w-5 h-5" />}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-sm text-text-tertiary">
                      Member since {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                    <Button 
                      type="submit" 
                      isLoading={loading}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">
                  Change Password
                </h2>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                  />

                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <p className="text-sm text-text-secondary">
                      Password must be at least 6 characters long and should include a mix of letters and numbers for better security.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      isLoading={loading}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
