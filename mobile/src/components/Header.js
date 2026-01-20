import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius} from '../theme/theme';

const Header = ({restaurantName, nextOrderNumber, activeView, onMenuPress, onOrdersPress, onWaitersPress, onExpensesPress, onSummaryPress}) => {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.container}
    >
      <View style={styles.topSection}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        <View style={styles.nextOrderContainer}>
          <Text style={styles.nextOrderLabel}>Next Order</Text>
          <Text style={styles.nextOrderNumber}>{nextOrderNumber}</Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsScrollContent}
      >
        <TouchableOpacity 
          style={[styles.actionButton, activeView === 'menu' && styles.activeButton]} 
          onPress={onMenuPress}
        >
          <Icon name="restaurant-menu" size={20} color={activeView === 'menu' ? colors.primary : colors.white} />
          <Text style={[styles.actionButtonText, activeView === 'menu' && styles.activeButtonText]}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, activeView === 'orders' && styles.activeButton]} 
          onPress={onOrdersPress}
        >
          <Icon name="receipt" size={20} color={activeView === 'orders' ? colors.primary : colors.white} />
          <Text style={[styles.actionButtonText, activeView === 'orders' && styles.activeButtonText]}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, activeView === 'waiters' && styles.activeButton]} 
          onPress={onWaitersPress}
        >
          <Icon name="people" size={20} color={activeView === 'waiters' ? colors.primary : colors.white} />
          <Text style={[styles.actionButtonText, activeView === 'waiters' && styles.activeButtonText]}>Waiters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, activeView === 'expenses' && styles.activeButton]} 
          onPress={onExpensesPress}
        >
          <Icon name="attach-money" size={20} color={activeView === 'expenses' ? colors.primary : colors.white} />
          <Text style={[styles.actionButtonText, activeView === 'expenses' && styles.activeButtonText]}>Expenses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, activeView === 'summary' && styles.activeButton]} 
          onPress={onSummaryPress}
        >
          <Icon name="assessment" size={20} color={activeView === 'summary' ? colors.primary : colors.white} />
          <Text style={[styles.actionButtonText, activeView === 'summary' && styles.activeButtonText]}>Summary</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  restaurantName: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  nextOrderContainer: {
    backgroundColor: colors.overlayLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  nextOrderLabel: {
    fontSize: typography.fontSize.xxl,
    color: colors.white,
    marginBottom: 2,
  },
  nextOrderNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: '#d8db34ff',
  },
  actionsScrollContent: {
    flexDirection: 'row',
    paddingRight: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayMedium,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    width: 100,
    marginRight: spacing.sm,
  },
  activeButton: {
    backgroundColor: colors.white,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  activeButtonText: {
    color: colors.primary,
  },
});

export default Header;
