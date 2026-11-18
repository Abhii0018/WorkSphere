import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { AttendanceProvider } from '../src/context/AttendanceContext';
import { LeaveProvider } from '../src/context/LeaveContext';
import { EmployeeProvider } from '../src/context/EmployeeContext';
import { TaskProvider } from '../src/context/TaskContext';
import { PayrollProvider } from '../src/context/PayrollContext';
import theme from '../src/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AttendanceProvider>
          <LeaveProvider>
            <EmployeeProvider>
              <TaskProvider>
                <PayrollProvider>
                  <StatusBar style="dark" backgroundColor={theme.colors.background} />
                  <Stack
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: theme.colors.surface,
                      },
                      headerTintColor: theme.colors.textPrimary,
                      headerTitleStyle: {
                        fontWeight: theme.typography.weight.bold,
                        fontSize: theme.typography.size.lg,
                      },
                      headerShadowVisible: false,
                      contentStyle: {
                        backgroundColor: theme.colors.background,
                      },
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="leave/index"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="employees/index"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="tasks/index"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="payroll/index"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="modal"
                      options={{
                        presentation: 'modal',
                        title: 'WorkSphere Info',
                        headerShown: true,
                      }}
                    />
                  </Stack>
                </PayrollProvider>
              </TaskProvider>
            </EmployeeProvider>
          </LeaveProvider>
        </AttendanceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
