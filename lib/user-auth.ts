// Mock user authentication system with localStorage persistence

export interface User {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  mobile?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  loginTime: string;
}

export class MockUserAuth {
  private static USERS_KEY = 'indivendi_users';
  private static SESSION_KEY = 'indivendi_session';

  // Get all users from localStorage
  static getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Save users to localStorage
  static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if email already exists
  static emailExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Sign up new user
  static signUp(email: string, password: string, confirmPassword: string, name: string): { success: boolean; error?: string; user?: User } {
    // Validation
    if (!email || !password || !confirmPassword || !name) {
      return { success: false, error: 'All fields are required' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (this.emailExists(email)) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password, // In real app, this would be hashed
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user
    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Create session
    this.createSession(newUser);

    return { success: true, user: newUser };
  }

  // Sign up new user without automatic login
  static signUpWithoutLogin(email: string, password: string, confirmPassword: string, name: string): { success: boolean; error?: string; user?: User } {
    // Validation
    if (!email || !password || !confirmPassword || !name) {
      return { success: false, error: 'All fields are required' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (this.emailExists(email)) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password, // In real app, this would be hashed
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user
    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Do NOT create session - user must login manually

    return { success: true, user: newUser };
  }

  // Sign in user
  static signIn(email: string, password: string): { success: boolean; error?: string; user?: User; role?: string } {
    // Validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Check for master admin credentials
    if (email.toLowerCase() === 'abhay@gmail.com' && password === 'abhay@123') {
      const masterAdmin: User = {
        id: 'master_admin_abhay',
        email: 'abhay@gmail.com',
        password: 'abhay@123',
        name: 'Abhay Kumar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create master admin session
      this.createMasterAdminSession(masterAdmin);
      return { success: true, user: masterAdmin, role: 'master_admin' };
    }

    // Check for sellers in the sellers storage
    try {
      const sellersData = localStorage.getItem('indivendi_sellers');
      if (sellersData) {
        const sellers = JSON.parse(sellersData);
        const seller = sellers.find((s: any) => 
          s.email.toLowerCase() === email.toLowerCase() && 
          s.password === password &&
          s.status === 'approved'
        );

        if (seller) {
          const sellerUser: User = {
            id: seller.id,
            email: seller.email,
            password: seller.password,
            name: seller.sellerName,
            createdAt: seller.registrationDate,
            updatedAt: seller.registrationDate
          };

          // Create seller session
          this.createSellerSession(sellerUser);
          return { success: true, user: sellerUser, role: 'seller' };
        }
      }
    } catch (error) {
      console.error('Error checking sellers:', error);
    }

    // Find regular user
    const users = this.getUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if user is suspended
    // if (user.status === 'suspended') {
    //   throw new Error('Account is suspended');
    // }

    // if (user.status === 'inactive') {
    //   throw new Error('Account is inactive');
    // }

    // Create session
    this.createSession(user);

    return { success: true, user, role: 'user' };
  }

  // Create user session
  static createSession(user: User): void {
    if (typeof window === 'undefined') return;

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      loginTime: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  // Create master admin session
  static createMasterAdminSession(user: User): void {
    if (typeof window === 'undefined') return;

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      loginTime: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'master_admin');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('loginStatus', 'active');
    } catch (error) {
      console.error('Error creating master admin session:', error);
    }
  }

  // Create seller session
  static createSellerSession(user: User): void {
    if (typeof window === 'undefined') return;

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      loginTime: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'seller');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('loginStatus', 'active');
    } catch (error) {
      console.error('Error creating seller session:', error);
    }
  }

  // Get current session
  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    const session = this.getSession();
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const loginStatus = localStorage.getItem('loginStatus') === 'active';

    // Check for special seller session
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail === 'rohit@gmail.com' && isAuth && loginStatus) {
      return true;
    }

    return (session !== null && isAuth) || (isAuth && loginStatus);
  }

  

  // Get current user data
  static getCurrentUser(): User | null {
    const session = this.getSession();
    const userEmail = this.getCurrentUserEmail();
    const userRole = this.getCurrentUserRole();

    // Handle master admin account
    if (userEmail === 'abhay@gmail.com' && userRole === 'master_admin') {
      return {
        id: 'master_admin_abhay',
        email: 'abhay@gmail.com',
        password: '', // Don't expose password
        name: 'Abhay Kumar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Handle sellers from seller storage
    if (userRole === 'seller' && userEmail) {
      try {
        const sellersData = localStorage.getItem('indivendi_sellers');
        if (sellersData) {
          const sellers = JSON.parse(sellersData);
          const seller = sellers.find((s: any) => s.email.toLowerCase() === userEmail.toLowerCase());
          if (seller) {
            return {
              id: seller.id,
              email: seller.email,
              password: '', // Don't expose password
              name: seller.sellerName,
              createdAt: seller.registrationDate,
              updatedAt: seller.registrationDate
            };
          }
        }
      } catch (error) {
        console.error('Error getting seller data:', error);
      }
    }

    // Handle legacy seller account
    if (userEmail === 'rohit@gmail.com' && userRole === 'seller') {
      return {
        id: 'seller_rohit_123',
        email: 'rohit@gmail.com',
        password: '', // Don't expose password
        name: 'Rohit Kumar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    if (!session) return null;

    const users = this.getUsers();
    return users.find(user => user.id === session.userId) || null;
  }

  // Get current user role
  static getCurrentUserRole(): string {
    if (typeof window === 'undefined') return 'user';
    return localStorage.getItem('userRole') || 'user';
  }

  // Check if current user has specific role
  static hasRole(role: string): boolean {
    return this.getCurrentUserRole() === role;
  }

  // Check if current user is admin
  static isAdmin(): boolean {
    return this.hasRole('master_admin');
  }

  // Check if current user is master admin
  static isMasterAdmin(): boolean {
    const userEmail = this.getCurrentUserEmail();
    const userRole = this.getCurrentUserRole();
    return userEmail === 'abhay@gmail.com' && userRole === 'master_admin';
  }

  // Check if current user is seller
  static isSeller(): boolean {
    return this.hasRole('seller');
  }

  // Get current user email
  static getCurrentUserEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userEmail');
  }

  // Enhanced sign out to clear all role data
  static signOut(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('loginStatus');

      // Clear any admin profile data
      const adminProfileKeys = Object.keys(localStorage).filter(key => key.startsWith('admin_profile_'));
      adminProfileKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  // Removed duplicate signOut function
}