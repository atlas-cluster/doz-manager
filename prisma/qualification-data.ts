import {
  ExperienceOption,
  LeadTimeOption,
} from '@/features/shared/lib/generated/prisma/enums'

const lecturerQualifications = {
  'thomas.schneider@provadis-hochschule.de': {
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
  },
  'julia.koehler@provadis-hochschule.de': {
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
  },
  'markus.weber@dozent-mail.de': {
    'Software Engineering I': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.none,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.none,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.none,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
  },
  'andreas.hoffmann@uni-mail.net': {
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
  },
  'sabine.neumann@provadis-hochschule.de': {
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
  },
  'laura.bauer@lehrbeauftragte.de': {
    'Marketing Management': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.none,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.none,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.none,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
  },
  'michael.krueger@provadis-hochschule.de': {
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
  },
  'daniel.richter@hochschule-mail.org': {
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
  },
  'stefan.mueller@provadis-hochschule.de': {
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
  },
  'katharina.fischer@dozentenpool.de': {
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
  },
  'alexander.becker@provadis-hochschule.de': {
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
  },
  'nina.wagner@lehrauftrag.net': {
    'Marketing Management': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.none,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.none,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
  },
  'patrick.lorenz@provadis-hochschule.de': {
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
  },
  'christian.seidel@fachdozent.org': {
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
  },
  'bernd.hartmann@business-school.edu': {
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.other_uni,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.other_uni,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.other_uni,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
  },
  'franziska.otto@provadis-hochschule.de': {
    'Grundlagen der BWL': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Marketing Management': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Einführung in die Informatik': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Software Engineering I': {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Web-Technologien': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    Datenbanksysteme: {
      leadTime: LeadTimeOption.four_weeks,
      experience: ExperienceOption.provadis,
    },
    'Agiles Projektmanagement': {
      leadTime: LeadTimeOption.short,
      experience: ExperienceOption.provadis,
    },
    'Fortgeschrittene Datenstrukturen': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Cloud Computing Architekturen': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Angewandte Künstliche Intelligenz': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
    'IT-Sicherheit & Compliance': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.provadis,
    },
    'Strategische Unternehmensfinanzierung': {
      leadTime: LeadTimeOption.more_weeks,
      experience: ExperienceOption.none,
    },
  },
}

export default lecturerQualifications
