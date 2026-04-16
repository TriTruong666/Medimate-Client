export interface HealthCondition {
    conditionId: string;
    conditionName: string;
    description: string;
    diagnosedDate: string;
    status: string;
}

export interface MemberHealthProfile {
    healthProfileId: string;
    memberId: string;
    bloodType: string;
    height: number;
    weight: number;
    bmi: number;
    insuranceNumber: string;
    conditions: HealthCondition[];
}