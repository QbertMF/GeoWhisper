import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      {/* Safe area padding for status bar/camera */}
      <View style={{ height: Math.max(insets.top, 20) }} />
      
      {/* Header content positioned below safe area */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Information
        </Text>
        <Pressable 
          style={[
            styles.closeButton, 
            { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]} 
          onPress={handleClose} 
          hitSlop={10}
        >
          {({ pressed }) => (
            <FontAwesome
              name="times"
              size={20}
              color={colorScheme === 'dark' ? '#fff' : '#000'}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <EditScreenInfo path="app/modal.tsx" />
        </View>
      </ScrollView>

      {/* Ensure bottom safe area */}
      <View style={{ height: Math.max(insets.bottom, 10) }} />

      {/* Use appropriate status bar style */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#000' : 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 15,
    bottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
