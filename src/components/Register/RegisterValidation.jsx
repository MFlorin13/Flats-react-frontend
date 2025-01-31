import { db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const checkEmailExists = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;  // Returns true if email exists, false if not
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};

export const validateRegistration = async (register, isGoogleSignUp = false) => {
  // Define required fields based on sign-up method
  let requiredFields;
  if (isGoogleSignUp) {
    requiredFields = ['firstName', 'lastName', 'birthDate']; // Google sign-up requirements
  } else {
    requiredFields = ['firstName', 'lastName', 'email', 'password', 'birthDate']; // Regular sign-up requirements
  }

  const missingFields = requiredFields.filter(field => !register[field]);
  if (missingFields.length > 0) {
    throw new Error("All fields are required.");
  }

  // First name validation
  if (register.firstName.length < 2) {
    throw new Error("First name must be at least 2 characters long.");
  }

  // Last name validation
  if (register.lastName.length < 2) {
    throw new Error("Last name must be at least 2 characters long.");
  }

  // Email validation only for non-Google sign-up
  if (!isGoogleSignUp) {
    if (!/^\S+@\S+\.\S+$/.test(register.email)) {
      throw new Error("Invalid email format.");
    }

    // Check if email already exists in Firestore
    const emailExists = await checkEmailExists(register.email);
    if (emailExists) {
      throw new Error("Email is already registered. Please use a different email.");
    }
  }

  // Password validation only for email/password sign-up
  if (!isGoogleSignUp && register.password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(register.password)) {
      throw new Error(
        "Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character."
      );
    }
  }

  // Birthdate validation
  if (!register.birthDate) {
    throw new Error("Birth date is required.");
  }
  
  const birthDate = new Date(register.birthDate);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age;

  if (finalAge < 18 || finalAge > 120) {
    throw new Error("Age must be between 18 and 120 years.");
  }
};