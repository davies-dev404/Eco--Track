import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Star, Leaf, Users, ArrowUp } from "lucide-react";

export default function Impact() {
  // Mock Data for Gamification
  const badges = [
      { id: 1, name: "Plastic Warrior", desc: "Recycled 10kg of plastic", icon: <Leaf className="h-6 w-6 text-green-600" />, earned: true },
      { id: 2, name: "Glass Guardian", desc: "Recycled 20 glass bottles", icon: <Star className="h-6 w-6 text-blue-600" />, earned: true },
      { id: 3, name: "Heavy Lifter", desc: "Complete a >50kg pickup", icon: <Crown className="h-6 w-6 text-yellow-600" />, earned: false },
      { id: 4, name: "Consistent Hero", desc: "5 weeks streak", icon: <Medal className="h-6 w-6 text-purple-600" />, earned: false },
  ];

  const leaderboard = [
      { rank: 1, name: "Sarah J.", points: 1250, badge: "Eco Legend" },
      { rank: 2, name: "Mike T.", points: 980, badge: "Master Recycler" },
      { rank: 3, name: "You", points: 850, badge: "Rising Star" },
      { rank: 4, name: "Davina K.", points: 720, badge: "Contributor" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Your Impact</h1>
        <p className="text-muted-foreground">Achievements and community contribution.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* Badges Section */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" /> Achievements
                  </CardTitle>
                  <CardDescription>Earn badges by recycling more.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                      {badges.map(badge => (
                          <div key={badge.id} className={`p-4 rounded-lg border flex flex-col items-center text-center transition-opacity ${badge.earned ? 'bg-green-50 border-green-200' : 'opacity-60 grayscale'}`}>
                              <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                                  {badge.icon}
                              </div>
                              <h4 className="font-bold text-sm">{badge.name}</h4>
                              <p className="text-xs text-muted-foreground">{badge.desc}</p>
                              {badge.earned && <Badge variant="success" className="mt-2 text-[10px] px-2 h-5">Earned</Badge>}
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>

          {/* Leaderboard Section */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" /> Community Leaderboard
                  </CardTitle>
                  <CardDescription>Top recyclers in your area this month.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {leaderboard.map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-slate-50">
                              <div className="flex items-center gap-4">
                                  <div className={`
                                      flex items-center justify-center w-8 h-8 rounded-full font-bold
                                      ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                                        user.rank === 2 ? 'bg-slate-200 text-slate-700' :
                                        user.rank === 3 ? 'bg-orange-100 text-orange-800' : 'text-muted-foreground'}
                                  `}>
                                      {user.rank}
                                  </div>
                                  <div>
                                      <p className={`font-medium ${user.name === 'You' ? 'text-green-600' : ''}`}>{user.name}</p>
                                      <p className="text-xs text-muted-foreground">{user.badge}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="font-bold">{user.points}</span> pts
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                      <ArrowUp className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800">
                          You need <strong>130 pts</strong> to reach #2! Consider scheduling a pickup this week.
                      </p>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
