import {Colors} from '../halabsaudi/Themes/Colors';
export const darkMapStyle = [
  {elementType: 'geometry', stylers: [{color: Colors.surface}]},
  {elementType: 'labels.text.stroke', stylers: [{color: Colors.background}]},
  {elementType: 'labels.text.fill', stylers: [{color: Colors.textSecondary}]},
  {featureType: 'road', elementType: 'geometry', stylers: [{color: Colors.border}]},
  {featureType: 'road.highway', elementType: 'geometry', stylers: [{color: Colors.accentSoft}]},
  {featureType: 'water', elementType: 'geometry', stylers: [{color: Colors.surfaceRaised}]},
  {featureType: 'poi.park', elementType: 'geometry', stylers: [{color: Colors.brandGreen}]},
];
