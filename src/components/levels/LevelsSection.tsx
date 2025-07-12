import React from 'react';
import { UserLevelCard } from './UserLevelCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userLevels } from './levelsData';

const LevelsSection: React.FC = () => {
  return (
    <Tabs defaultValue="common" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="common">Usuário Comum</TabsTrigger>
        <TabsTrigger value="collector">Coletor Individual</TabsTrigger>
        <TabsTrigger value="partner">Empresa Parceira</TabsTrigger>
        <TabsTrigger value="cooperative">Cooperativa</TabsTrigger>
        <TabsTrigger value="company">Empresa Coletora</TabsTrigger>
      </TabsList>

      <TabsContent value="common" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UserLevelCard level={userLevels.common.bronze} userType="common" levelType="bronze" />
          <UserLevelCard level={userLevels.common.silver} userType="common" levelType="silver" />
          <UserLevelCard level={userLevels.common.gold} userType="common" levelType="gold" />
        </div>
      </TabsContent>

      <TabsContent value="collector" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UserLevelCard level={userLevels.collector.bronze} userType="collector" levelType="bronze" />
          <UserLevelCard level={userLevels.collector.silver} userType="collector" levelType="silver" />
          <UserLevelCard level={userLevels.collector.gold} userType="collector" levelType="gold" />
        </div>
      </TabsContent>

      <TabsContent value="partner" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UserLevelCard level={userLevels.partner.bronze} userType="partner" levelType="bronze" />
          <UserLevelCard level={userLevels.partner.silver} userType="partner" levelType="silver" />
          <UserLevelCard level={userLevels.partner.gold} userType="partner" levelType="gold" />
        </div>
      </TabsContent>

      <TabsContent value="cooperative" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UserLevelCard level={userLevels.cooperative.bronze} userType="cooperative" levelType="bronze" />
          <UserLevelCard level={userLevels.cooperative.silver} userType="cooperative" levelType="silver" />
          <UserLevelCard level={userLevels.cooperative.gold} userType="cooperative" levelType="gold" />
        </div>
      </TabsContent>

      <TabsContent value="company" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UserLevelCard level={userLevels.company.bronze} userType="company" levelType="bronze" />
          <UserLevelCard level={userLevels.company.silver} userType="company" levelType="silver" />
          <UserLevelCard level={userLevels.company.gold} userType="company" levelType="gold" />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LevelsSection; 