# GNOME Monitor Brightness Extension

## Description
Cette extension GNOME permet d'afficher le nombre d'écrans connectés et de contrôler la luminosité de chaque écran à l'aide d'un curseur intégré dans le menu déroulant.

## Fonctionnalités
- Affiche dynamiquement le nombre de moniteurs connectés.
- Permet d'ajuster la luminosité des écrans via `xrandr`.
- Ajoute une icône à côté du nom de chaque écran.
- Mise à jour automatique lors de la connexion ou déconnexion d'un écran.
- Curseur de luminosité avec icône pour chaque écran.

## Prérequis
- GNOME Shell
- `xrandr` installé sur votre système

### Installation de `xrandr`
Sur Debian/Ubuntu :
```bash
sudo apt install x11-xserver-utils
```
Sur Fedora :
```bash
sudo dnf install xrandr
```
Sur Arch Linux :
```bash
sudo pacman -S xorg-xrandr
```

## Installation de l'extension
1. **Copier les fichiers** :
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/monitor-brightness@user
   cp -r * ~/.local/share/gnome-shell/extensions/monitor-brightness@user
   ```

2. **Activer l'extension** :
   ```bash
   gnome-extensions enable monitor-brightness@user
   ```

3. **Redémarrer GNOME Shell** (si nécessaire) :
   ```bash
   Alt + F2, puis tapez 'r' et appuyez sur Entrée
   ```

## Utilisation
- L'extension ajoute un indicateur de moniteur dans la barre supérieure de GNOME.
- Cliquez sur l'indicateur pour afficher la liste des moniteurs et ajuster leur luminosité.
- Faites glisser le curseur pour modifier la luminosité.

## Désinstallation
Pour désactiver et supprimer l'extension :
```bash
gnome-extensions disable monitor-brightness@user
rm -rf ~/.local/share/gnome-shell/extensions/monitor-brightness@user
```

## Dépannage
- Si la luminosité ne change pas, assurez-vous que `xrandr` détecte bien l'écran avec :
  ```bash
  xrandr --query
  ```
- Si vous utilisez Wayland, `xrandr` pourrait ne pas fonctionner. Dans ce cas, utilisez `brightnessctl` comme alternative.

## Licence
Ce projet est sous licence MIT.

## Auteur
Développé par [Aynache Mohamed Abdallah]

