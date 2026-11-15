import type { NotificationCategory } from '@/types/domain';
import { colors } from '@/theme/tokens';

export const catMeta: Record<NotificationCategory, { label: string; icon: string; color: string }> = {
  rare_alert: { label: 'Rare aircraft alerts', icon: 'alert-circle', color: colors.sim },
  follower: { label: 'New followers', icon: 'person-add', color: colors.cyan },
  like: { label: 'Likes', icon: 'heart', color: colors.live },
  comment: { label: 'Comments', icon: 'chatbubble', color: colors.primary },
  challenge: { label: 'Challenge progress', icon: 'flag', color: colors.success },
  milestone: { label: 'Collection milestones', icon: 'trophy', color: colors.sim },
  database: { label: 'Database updates', icon: 'server', color: colors.silver },
  competition: { label: 'Photo competitions', icon: 'aperture', color: colors.review },
  announcement: { label: 'Community announcements', icon: 'megaphone', color: colors.cyan },
};

