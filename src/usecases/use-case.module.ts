import { Module } from '@nestjs/common';
import { TaxonomyModule } from '../modules/taxonomy/taxonomy.module.js';
import { OrganisationsModule } from '../modules/organisations/organisations.module.js';
import { UsersModule } from '../modules/users/users.module.js';
import { ServicesModule } from '../modules/services/services.module.js';
import { NeedsModule } from '../modules/needs/needs.module.js';
import { AnalyticsModule } from '../modules/analytics/analytics.module.js';
import { UploadModule } from '../modules/upload/upload.module.js';
import { NotificationsModule } from '../modules/notifications/notifications.module.js';
import { EmailModule } from '../modules/email/email.module.js';
import { AuthModule } from '../modules/auth/auth.module.js';
import { SubscriptionsModule } from '../modules/subscriptions/subscriptions.module.js';
// Taxonomy
import { GetManyTopicsUseCase } from './taxonomy/get-many-topics.usecase.js';
import { GetOneTopicUseCase } from './taxonomy/get-one-topic.usecase.js';
import { GetTopicTreeUseCase } from './taxonomy/get-topic-tree.usecase.js';
import { CreateTopicUseCase } from './taxonomy/create-topic.usecase.js';
import { UpdateTopicUseCase } from './taxonomy/update-topic.usecase.js';
import { DeleteTopicUseCase } from './taxonomy/delete-topic.usecase.js';
import { GetManyNeedTagsUseCase } from './taxonomy/get-many-need-tags.usecase.js';
import { GetOneNeedTagUseCase } from './taxonomy/get-one-need-tag.usecase.js';
import { CreateNeedTagUseCase } from './taxonomy/create-need-tag.usecase.js';
import { UpdateNeedTagUseCase } from './taxonomy/update-need-tag.usecase.js';
import { DeleteNeedTagUseCase } from './taxonomy/delete-need-tag.usecase.js';
import { GetManyTargetGroupsUseCase } from './taxonomy/get-many-target-groups.usecase.js';
import { GetOneTargetGroupUseCase } from './taxonomy/get-one-target-group.usecase.js';
import { CreateTargetGroupUseCase } from './taxonomy/create-target-group.usecase.js';
import { UpdateTargetGroupUseCase } from './taxonomy/update-target-group.usecase.js';
import { DeleteTargetGroupUseCase } from './taxonomy/delete-target-group.usecase.js';
// Organisations
import { GetManyOrganisationsUseCase } from './organisations/get-many-organisations.usecase.js';
import { GetOneOrganisationUseCase } from './organisations/get-one-organisation.usecase.js';
import { CreateOrganisationUseCase } from './organisations/create-organisation.usecase.js';
import { UpdateOrganisationUseCase } from './organisations/update-organisation.usecase.js';
import { DeleteOrganisationUseCase } from './organisations/delete-organisation.usecase.js';
import { ActivateOrganisationUseCase } from './organisations/activate-organisation.usecase.js';
import { DeactivateOrganisationUseCase } from './organisations/deactivate-organisation.usecase.js';
import { CreateJoinNetworkRequestUseCase } from './organisations/create-join-network-request.usecase.js';
import { ApproveOrganisationUseCase } from './organisations/approve-organisation.usecase.js';
import { RejectOrganisationUseCase } from './organisations/reject-organisation.usecase.js';
// Users
import { GetManyUsersUseCase } from './users/get-many-users.usecase.js';
import { GetOneUserUseCase } from './users/get-one-user.usecase.js';
import { CreateUserUseCase } from './users/create-user.usecase.js';
import { UpdateUserUseCase } from './users/update-user.usecase.js';
import { DeleteUserUseCase } from './users/delete-user.usecase.js';
import { ActivateUserUseCase } from './users/activate-user.usecase.js';
import { DeactivateUserUseCase } from './users/deactivate-user.usecase.js';
import { ResetUserPasswordUseCase } from './users/reset-user-password.usecase.js';
// Services
import { GetManyServicesUseCase } from './services/get-many-services.usecase.js';
import { GetOneServiceUseCase } from './services/get-one-service.usecase.js';
import { CreateServiceUseCase } from './services/create-service.usecase.js';
import { UpdateServiceUseCase } from './services/update-service.usecase.js';
import { DeleteServiceUseCase } from './services/delete-service.usecase.js';
import { SearchServicesUseCase } from './services/search-services.usecase.js';
import { PublishServiceUseCase } from './services/publish-service.usecase.js';
import { UnpublishServiceUseCase } from './services/unpublish-service.usecase.js';
// Needs
import { GetManyNeedsUseCase } from './needs/get-many-needs.usecase.js';
import { GetOneNeedUseCase } from './needs/get-one-need.usecase.js';
import { CreateNeedUseCase } from './needs/create-need.usecase.js';
import { UpdateNeedUseCase } from './needs/update-need.usecase.js';
import { AssignNeedUseCase } from './needs/assign-need.usecase.js';
import { DeleteNeedUseCase } from './needs/delete-need.usecase.js';
import { GetNeedsMapUseCase } from './needs/get-needs-map.usecase.js';
import { AddNeedCommentUseCase } from './needs/add-need-comment.usecase.js';
import { GetNeedEventsUseCase } from './needs/get-need-events.usecase.js';
// Analytics
import { LogSearchUseCase } from './analytics/log-search.usecase.js';
import { GetOverviewUseCase } from './analytics/get-overview.usecase.js';
import { GetSearchStatsUseCase } from './analytics/get-search-stats.usecase.js';
import { GetFilterStatsUseCase } from './analytics/get-filter-stats.usecase.js';
import { GetOrgOverviewUseCase } from './analytics/get-org-overview.usecase.js';
import { GetTopQueriesUseCase } from './analytics/get-top-queries.usecase.js';
import { GetZeroResultQueriesUseCase } from './analytics/get-zero-result-queries.usecase.js';
import { GetSearchFrequencyUseCase } from './analytics/get-search-frequency.usecase.js';
import { GetAllSearchesUseCase } from './analytics/get-all-searches.usecase.js';
import { GetMostUsedFiltersUseCase } from './analytics/get-most-used-filters.usecase.js';
import { GetLeastUsedFiltersUseCase } from './analytics/get-least-used-filters.usecase.js';
import { GetFilterHeatmapUseCase } from './analytics/get-filter-heatmap.usecase.js';
import { GetDashboardTrendsUseCase } from './analytics/get-dashboard-trends.usecase.js';
import { GetOrgDashboardTrendsUseCase } from './analytics/get-org-dashboard-trends.usecase.js';
// Upload
import { GetPresignedUrlUseCase } from './upload/get-presigned-url.usecase.js';
// Notifications
import { GetNotificationsUseCase } from './notifications/get-notifications.usecase.js';
import { GetUnreadCountUseCase } from './notifications/get-unread-count.usecase.js';
import { MarkNotificationReadUseCase } from './notifications/mark-notification-read.usecase.js';
import { MarkAllNotificationsReadUseCase } from './notifications/mark-all-notifications-read.usecase.js';
// Subscriptions
import { CreateSubscriptionUseCase } from './subscriptions/create-subscription.usecase.js';
import { UnsubscribeUseCase } from './subscriptions/unsubscribe.usecase.js';
import { NotifyMatchingSubscribersUseCase } from './subscriptions/notify-matching-subscribers.usecase.js';

const taxonomyUseCases = [
  GetManyTopicsUseCase,
  GetOneTopicUseCase,
  GetTopicTreeUseCase,
  CreateTopicUseCase,
  UpdateTopicUseCase,
  DeleteTopicUseCase,
  GetManyNeedTagsUseCase,
  GetOneNeedTagUseCase,
  CreateNeedTagUseCase,
  UpdateNeedTagUseCase,
  DeleteNeedTagUseCase,
  GetManyTargetGroupsUseCase,
  GetOneTargetGroupUseCase,
  CreateTargetGroupUseCase,
  UpdateTargetGroupUseCase,
  DeleteTargetGroupUseCase,
];

const organisationUseCases = [
  GetManyOrganisationsUseCase,
  GetOneOrganisationUseCase,
  CreateOrganisationUseCase,
  UpdateOrganisationUseCase,
  DeleteOrganisationUseCase,
  ActivateOrganisationUseCase,
  DeactivateOrganisationUseCase,
  CreateJoinNetworkRequestUseCase,
  ApproveOrganisationUseCase,
  RejectOrganisationUseCase,
];

const userUseCases = [
  GetManyUsersUseCase,
  GetOneUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  ActivateUserUseCase,
  DeactivateUserUseCase,
  ResetUserPasswordUseCase,
];

const serviceUseCases = [
  GetManyServicesUseCase,
  GetOneServiceUseCase,
  CreateServiceUseCase,
  UpdateServiceUseCase,
  DeleteServiceUseCase,
  SearchServicesUseCase,
  PublishServiceUseCase,
  UnpublishServiceUseCase,
];

const needUseCases = [
  GetManyNeedsUseCase,
  GetOneNeedUseCase,
  CreateNeedUseCase,
  UpdateNeedUseCase,
  AssignNeedUseCase,
  DeleteNeedUseCase,
  GetNeedsMapUseCase,
  AddNeedCommentUseCase,
  GetNeedEventsUseCase,
];

const analyticsUseCases = [
  LogSearchUseCase,
  GetOverviewUseCase,
  GetSearchStatsUseCase,
  GetFilterStatsUseCase,
  GetOrgOverviewUseCase,
  GetTopQueriesUseCase,
  GetZeroResultQueriesUseCase,
  GetSearchFrequencyUseCase,
  GetAllSearchesUseCase,
  GetMostUsedFiltersUseCase,
  GetLeastUsedFiltersUseCase,
  GetFilterHeatmapUseCase,
  GetDashboardTrendsUseCase,
  GetOrgDashboardTrendsUseCase,
];

const uploadUseCases = [GetPresignedUrlUseCase];

const notificationUseCases = [
  GetNotificationsUseCase,
  GetUnreadCountUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
];

const subscriptionUseCases = [
  CreateSubscriptionUseCase,
  UnsubscribeUseCase,
  NotifyMatchingSubscribersUseCase,
];

@Module({
  imports: [TaxonomyModule, OrganisationsModule, UsersModule, ServicesModule, NeedsModule, AnalyticsModule, UploadModule, NotificationsModule, EmailModule, AuthModule, SubscriptionsModule],
  providers: [...taxonomyUseCases, ...organisationUseCases, ...userUseCases, ...serviceUseCases, ...needUseCases, ...analyticsUseCases, ...uploadUseCases, ...notificationUseCases, ...subscriptionUseCases],
  exports: [...taxonomyUseCases, ...organisationUseCases, ...userUseCases, ...serviceUseCases, ...needUseCases, ...analyticsUseCases, ...uploadUseCases, ...notificationUseCases, ...subscriptionUseCases],
})
export class UseCaseModule {}
