import type { MailService } from '@src/modules/mail/contracts';
import type { User } from '@src/modules/user/contracts';
import { HOST_APPLICATION_MAIL_SOURCE } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import type { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import {
  getHostApplicationAdminUrl,
  getHostApplicationApplicantUrl,
  getHostApplicationBrandName,
  getHostApplicationNotifyEmail,
} from '@src/modules/host-application/applications/services/host-application-urls';

export class HostApplicationMailService {
  constructor(private readonly mailService: MailService) {}

  async notifySubmitted(
    application: HostApplication,
    applicant: User,
  ): Promise<void> {
    const brand = getHostApplicationBrandName();
    const applicantUrl = getHostApplicationApplicantUrl();
    const adminUrl = getHostApplicationAdminUrl();
    const staffEmail = getHostApplicationNotifyEmail();

    await this.mailService.sendSimple({
      to: applicant.email,
      subject: `${brand} — demande d’hôte reçue`,
      body: [
        `Bonjour ${applicant.firstName},`,
        '',
        'Nous avons bien reçu votre demande pour devenir hôte.',
        `Ville : ${application.city}`,
        application.propertyName
          ? `Établissement envisagé : ${application.propertyName}`
          : null,
        '',
        'Un administrateur va l’examiner. Vous serez informé par email dès qu’une décision sera prise.',
        `Suivre ma demande : ${applicantUrl}`,
      ]
        .filter((line) => line !== null)
        .join('\n'),
      sourceModule: HOST_APPLICATION_MAIL_SOURCE,
    });

    if (!staffEmail) {
      return;
    }

    await this.mailService.sendSimple({
      to: staffEmail,
      subject: `${brand} — nouvelle candidature hôte`,
      body: [
        `Une nouvelle demande pour devenir hôte a été envoyée.`,
        '',
        `Candidat : ${applicant.firstName} ${applicant.lastName} (${applicant.email})`,
        `Téléphone : ${applicant.phoneNumber}`,
        `Ville : ${application.city}`,
        application.propertyName
          ? `Établissement envisagé : ${application.propertyName}`
          : null,
        '',
        'Message :',
        application.message,
        '',
        `Examiner la demande : ${adminUrl}`,
      ]
        .filter((line) => line !== null)
        .join('\n'),
      sourceModule: HOST_APPLICATION_MAIL_SOURCE,
    });
  }

  async notifyReviewed(
    application: HostApplication,
    applicant: User,
  ): Promise<void> {
    const brand = getHostApplicationBrandName();
    const applicantUrl = getHostApplicationApplicantUrl();
    const approved = application.status === HOST_APPLICATION_STATUS.APPROVED;

    await this.mailService.sendSimple({
      to: applicant.email,
      subject: approved
        ? `${brand} — votre demande d’hôte a été acceptée`
        : `${brand} — votre demande d’hôte n’a pas été retenue`,
      body: approved
        ? [
            `Bonjour ${applicant.firstName},`,
            '',
            'Bonne nouvelle : votre demande pour devenir hôte a été acceptée.',
            application.reviewComment
              ? `Message de l’équipe : ${application.reviewComment}`
              : null,
            '',
            'Reconnectez-vous pour accéder à votre espace hôte et créer votre établissement.',
            applicantUrl,
          ]
            .filter((line) => line !== null)
            .join('\n')
        : [
            `Bonjour ${applicant.firstName},`,
            '',
            'Votre demande pour devenir hôte n’a pas été retenue pour le moment.',
            application.reviewComment
              ? `Motif : ${application.reviewComment}`
              : null,
            '',
            'Vous pouvez déposer une nouvelle demande après avoir pris en compte ce retour.',
            applicantUrl,
          ]
            .filter((line) => line !== null)
            .join('\n'),
      sourceModule: HOST_APPLICATION_MAIL_SOURCE,
    });
  }
}
